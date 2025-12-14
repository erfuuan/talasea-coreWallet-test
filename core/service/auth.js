import {  ConflictError, UnauthorizedError } from '../utils/errors.js';
import cryptography from '../utils/cryptography.js';
import { buildToken } from '../utils/tokenGenerator.js';

export default class AuthService {
  constructor({ UserModel, WalletModel, mongoService }) {
    if (!UserModel) throw new Error('UserModel is required');
    if (!WalletModel) throw new Error('WalletModel is required');
    if (!mongoService) throw new Error('mongoService is required');

    this.User = UserModel;
    this.Wallet = WalletModel;
    this.mongoService = mongoService;
  }

  async signup({ firstName, lastName, nationalCode, phone, password }) {
    let session;
    try {
      // Check if user already exists
      const existing = await this.mongoService.findOneRecord(this.User, {
        $or: [{ phone }, { nationalCode }],
      });

      if (existing) {
        throw new ConflictError('User already exists');
      }

      // Hash password
      const hashedPassword = await cryptography.password.hash(password);

      // Start transaction
      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);

      // Create user
      const user = await this.mongoService.create(
        this.User,
        {
          firstName,
          lastName,
          nationalCode,
          phone,
          password: hashedPassword,
        },
        { session }
      );

      // Create wallet for user
      await this.mongoService.create(
        this.Wallet,
        {
          userId: user._id,
          balance: 0,
          lockedBalance: 0,
        },
        { session }
      );

      // Commit transaction
      await this.mongoService.commitTransaction(session);

      // Generate token
      const token = buildToken(user);

      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalCode: user.nationalCode,
        phone: user.phone,
        role: user.role,
        token: `Bearer ${token}`,
      };
    } catch (err) {
      if (session) {
        await this.mongoService.abortTransaction(session);
      }
      throw err;
    } finally {
      if (session) {
        this.mongoService.endSession(session);
      }
    }
  }

  async login({ phone, password }) {
    const user = await this.mongoService.findOneRecord(this.User, { phone });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await cryptography.password.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = buildToken(user);

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalCode: user.nationalCode,
      phone: user.phone,
      role: user.role,
      token: `Bearer ${token}`,
    };
  }
}
