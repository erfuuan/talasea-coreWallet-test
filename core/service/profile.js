import { NotFoundError, ConflictError } from '../utils/errors.js';
import cryptography from '../utils/cryptography.js';

export default class ProfileService {
  constructor({ UserModel, mongoService }) {
    if (!UserModel) throw new Error('UserModel is required');
    if (!mongoService) throw new Error('mongoService is required');

    this.User = UserModel;
    this.mongoService = mongoService;
  }

  async getProfile(userId) {
    const user = await this.mongoService.findById(this.User, userId, {
      select: '-password -_id',
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    if (updateData.phone) {
      const existing = await this.mongoService.findOneRecord(this.User, {
        phone: updateData.phone,
        _id: { $ne: userId },
      });

      if (existing) {
        throw new ConflictError('Phone already in use');
      }
    }

    if (updateData.password) {
      updateData.password = await cryptography.password.hash(updateData.password);
    }

    const updatedUser = await this.mongoService.updateById(
      this.User,
      updateData,
      userId,
      {
        select: '-password -_id',
      }
    );

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }
}
