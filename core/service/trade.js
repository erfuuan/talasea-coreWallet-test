import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors.js';
import cryptography from '../utils/cryptography.js';
import { TransactionType, TransactionStatus, getOnlineTradeType } from '../enum/transactionEnums.js';

export default class TradeService {
  constructor({ WalletModel, TransactionModel, CommodityModel, OnlineAssetModel, mongoService, redisLockService, idempotencyService }) {
    if (!mongoService) throw new Error("mongoService is required");
    if (!redisLockService) throw new Error("redisLockService is required");
    if (!idempotencyService) throw new Error("idempotencyService is required");
    if (!WalletModel) throw new Error("WalletModel is required");
    if (!TransactionModel) throw new Error("TransactionModel is required");
    if (!CommodityModel) throw new Error("CommodityModel is required");

    this.Wallet = WalletModel;
    this.Transaction = TransactionModel;
    this.mongoService = mongoService;
    this.redisLockService = redisLockService;
    this.idempotencyService = idempotencyService;
    this.Commodity = CommodityModel;
    this.OnlineAsset = OnlineAssetModel;
  }

  async buyCommodity({ userId, commodity, amount, idempotencyKey }) {
    let session, lockKey, lockToken;
    try {
      lockKey = `lock:buy-commodity:${userId}:${commodity}`;
      lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
      if (!lockToken) throw new ConflictError("Another buy process is already in progress");

      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);

      const priceRecord = await this.mongoService.findOneRecord(
        this.Commodity,
        { commodity },
        { session }
      );
      if (!priceRecord) throw new NotFoundError("Commodity price not found.");

      const unitPrice = priceRecord.price;
      if (unitPrice <= 0) throw new BadRequestError("Invalid commodity price.");

      const FEE_PERCENT = priceRecord.feePercent || 0;
      const tradeValue = unitPrice * amount;
      const fee = tradeValue * FEE_PERCENT;
      const totalCost = tradeValue + fee;

      const wallet = await this.mongoService.findOneRecord(
        this.Wallet,
        { userId },
        { session }
      );
      if (!wallet) throw new NotFoundError("Wallet not found.");
      if (wallet.balance < totalCost) throw new BadRequestError("Insufficient balance.");

      const balanceBefore = wallet.balance;

      const updatedWallet = await this.mongoService.findOneAndUpdate(
        this.Wallet,
        { _id: wallet._id, __v: wallet.__v, balance: { $gte: totalCost } },
        { $inc: { balance: -totalCost, __v: 1 } },
        { new: true, session }
      );
      if (!updatedWallet) {
        throw new ConflictError("Wallet was updated by another process or insufficient balance. Try again.");
      }

      const onlineAsset = await this.mongoService.findOneRecord(
        this.OnlineAsset,
        { userId },
        { session }
      );

      if (!onlineAsset) {
        await this.mongoService.create(
          this.OnlineAsset,
          {
            userId,
            assets: {
              [commodity.toLowerCase()]: { weight: amount }
            }
          },
          { session }
        );
      } else {
        await this.mongoService.findOneAndUpdate(
          this.OnlineAsset,
          { userId },
          { $inc: { [`assets.${commodity.toLowerCase()}.weight`]: amount } },
          { session }
        );
      }

      const transaction = await this.mongoService.create(
        this.Transaction,
        {
          userId,
          commodity,
          type: getOnlineTradeType("BUY", commodity),
          status: TransactionStatus.SUCCESS,
          amount,
          pricePerUnit: unitPrice,
          fee,
          total: totalCost,
          refId: cryptography.trackId(),
          meta: {
            balanceBefore,
            balanceAfter: updatedWallet.balance,
          },
        },
        { session }
      );

      await this.mongoService.commitTransaction(session);

      if (idempotencyKey) {
        await this.idempotencyService.setJSON(
          idempotencyKey,
          transaction,
          60 * 60 * 24
        );
      }

      return transaction;
    } catch (err) {
      await this.mongoService.abortTransaction(session);
      throw err;
    } finally {
      await this.mongoService.endSession(session);
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }



  async sellCommodity({ userId, commodity, amount, idempotencyKey }) {
    let session, lockKey, lockToken;
    try {
      lockKey = `lock:sell-commodity:${userId}:${commodity}`;
      lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
      if (!lockToken) throw new ConflictError("Another sell process is already in progress");

      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);

      const priceRecord = await this.mongoService.findOneRecord(
        this.Commodity,
        { commodity },
        { session }
      );
      if (!priceRecord) throw new NotFoundError("Commodity price not found.");

      const unitPrice = priceRecord.price;
      if (unitPrice <= 0) throw new BadRequestError("Invalid commodity price.");

      const FEE_PERCENT = priceRecord.feePercent || 0;
      const tradeValue = unitPrice * amount;
      const fee = tradeValue * FEE_PERCENT;
      const totalIncome = tradeValue - fee;

      const onlineAsset = await this.mongoService.findOneRecord(
        this.OnlineAsset,
        { userId },
        { session }
      );

      if (!onlineAsset || (onlineAsset.assets[commodity.toLowerCase()]?.weight || 0) < amount) {
        throw new BadRequestError("Insufficient commodity balance to sell.");
      }

      const updatedOnlineAsset = await this.mongoService.findOneAndUpdate(
        this.OnlineAsset,
        { userId, [`assets.${commodity.toLowerCase()}.weight`]: { $gte: amount } },
        { $inc: { [`assets.${commodity.toLowerCase()}.weight`]: -amount } },
        { new: true, session }
      );

      if (!updatedOnlineAsset) {
        throw new ConflictError("Commodity was updated by another process. Try again.");
      }

      const wallet = await this.mongoService.findOneRecord(
        this.Wallet,
        { userId },
        { session }
      );
      if (!wallet) throw new NotFoundError("Wallet not found.");

      const balanceBefore = wallet.balance;
      const updatedWallet = await this.mongoService.findOneAndUpdate(
        this.Wallet,
        { _id: wallet._id, __v: wallet.__v },
        { $inc: { balance: totalIncome, __v: 1 } },
        { new: true, session }
      );

      if (!updatedWallet) {
        throw new ConflictError("Wallet was updated by another process. Try again.");
      }

      const transaction = await this.mongoService.create(
        this.Transaction,
        {
          userId,
          commodity,
          type: getOnlineTradeType("SELL", commodity),
          status: TransactionStatus.SUCCESS,
          amount,
          pricePerUnit: unitPrice,
          fee,
          total: totalIncome,
          refId: cryptography.trackId(),
          meta: {
            balanceBefore,
            balanceAfter: updatedWallet.balance,
          },
        },
        { session }
      );

      await this.mongoService.commitTransaction(session);

      if (idempotencyKey) {
        await this.idempotencyService.setJSON(
          idempotencyKey,
          transaction,
          60 * 60 * 24
        );
      }

      return transaction;

    } catch (err) {
      await this.mongoService.abortTransaction(session);
      throw err;
    } finally {
      await this.mongoService.endSession(session);
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }


}


