import { BadRequestError, ConflictError, NotFoundError } from "../utils/errors.js";
import cryptography from "../utils/cryptography.js";
import { TransactionType, TransactionStatus } from "../enum/transactionEnums.js";

export default class WalletService {
  constructor({ WalletModel, TransactionModel, mongoService, redisLockService, idempotencyService }) {
    if (!mongoService) throw new Error("mongoService is required");
    if (!redisLockService) throw new Error("redisLockService is required");

    this.Wallet = WalletModel;
    this.Transaction = TransactionModel;
    this.mongoService = mongoService;
    this.redisLockService = redisLockService;
    this.idempotencyService = idempotencyService;
  }

  async getWallet(userId) {
    const wallet = await this.mongoService.findOneRecord(this.Wallet, { userId });
    if (!wallet) throw new NotFoundError("Wallet not found");
    return wallet;
  }

  async withdraw(userId, amount, idempotencyKey) {
    if (amount <= 0) throw new BadRequestError("Amount must be positive");
    let session, lockKey, lockToken
    try {
      lockKey = `lock:wallet:${userId}`;
      lockToken = await this.redisLockService.acquireLock(lockKey, 7000);
      if (!lockToken) throw new ConflictError("Another wallet operation is in progress");

      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);

      const wallet = await this.mongoService.findOneRecord(this.Wallet, { userId }, { session });
      if (!wallet) throw new NotFoundError("Wallet not found");

      if (wallet.balance < amount) {
        throw new BadRequestError("Insufficient balance");
      }

      const balanceBefore = wallet.balance;

      const updatedWallet = await this.mongoService.findOneAndUpdate(this.Wallet, { _id: wallet._id, __v: wallet.__v }, { $inc: { balance: -amount, lockedBalance: amount, __v: 1 } }, { new: true, session });

      if (!updatedWallet) {
        throw new ConflictError("Wallet was updated by another process. Try again.");
      }
      await this.mongoService.create(this.Transaction, {
        userId,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.SUCCESS,
        amount,
        refId: cryptography.trackId(),
        meta: {
          reason: "Withdraw by user",
          balanceBefore,
          balanceAfter: updatedWallet.balance,
        },
      }, { session });

      await this.mongoService.commitTransaction(session);

      if (idempotencyKey) {
        await this.idempotencyService.setJSON(idempotencyKey, updatedWallet, 60 * 60 * 24);
      }

      return updatedWallet;

    } catch (err) {
      await this.mongoService.abortTransaction(session);
      throw err;

    } finally {
      this.mongoService.endSession(session);
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }

  async deposit(userId, amount, idempotencyKey) {
    if (amount <= 0) throw new BadRequestError("Amount must be positive");
    let session, lockKey, lockToken
    try {
      lockKey = `lock:wallet:${userId}`;
      lockToken = await this.redisLockService.acquireLock(lockKey, 7000);
      if (!lockToken) throw new ConflictError("Another wallet operation is in progress");

      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);
      const wallet = await this.mongoService.findOneRecord(this.Wallet, { userId }, { session });
      if (!wallet) throw new NotFoundError("Wallet not found");

      const balanceBefore = wallet.balance;

      const updatedWallet = await this.mongoService.findOneAndUpdate(this.Wallet, { _id: wallet._id, __v: wallet.__v }, { $inc: { balance: amount, __v: 1 } }, { new: true, session });

      if (!updatedWallet) {
        throw new ConflictError("Wallet was updated by another process. Try again.");
      }

      await this.mongoService.create(this.Transaction,
        {
          userId,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.SUCCESS,
          amount,
          refId: cryptography.trackId(),
          meta: {
            reason: "Deposit by user",
            balanceBefore,
            balanceAfter: updatedWallet.balance,
          },
        }, { session });

      await this.mongoService.commitTransaction(session);

      if (idempotencyKey) {
        await this.idempotencyService.setJSON(idempotencyKey, updatedWallet, 60 * 60 * 24);
      }

      return updatedWallet;
    } catch (err) {
      await this.mongoService.abortTransaction(session);
      throw err;
    } finally {
      this.mongoService.endSession(session);
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }
}
