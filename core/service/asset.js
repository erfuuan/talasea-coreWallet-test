import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import cryptography from '../utils/cryptography.js';

export default class AssetService {
  constructor({
    AssetModel,
    WalletModel,
    TransactionModel,
    ProductModel,
    mongoService,
    redisLockService,
    idempotencyService,
  }) {
    if (!AssetModel) throw new Error('AssetModel is required');
    if (!WalletModel) throw new Error('WalletModel is required');
    if (!TransactionModel) throw new Error('TransactionModel is required');
    if (!ProductModel) throw new Error('ProductModel is required');
    if (!mongoService) throw new Error('mongoService is required');
    if (!redisLockService) throw new Error('redisLockService is required');
    if (!idempotencyService) throw new Error('idempotencyService is required');

    this.Asset = AssetModel;
    this.Wallet = WalletModel;
    this.Transaction = TransactionModel;
    this.Product = ProductModel;
    this.mongoService = mongoService;
    this.redisLockService = redisLockService;
    this.idempotencyService = idempotencyService;
  }

  async getAsset(userId, type) {
    const asset = await this.mongoService.findOneRecord(this.Asset, {
      userId,
      type,
    });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    return asset;
  }

  async buyAsset(userId, productId, grams, idempotencyKey) {
    if (grams <= 0) throw new BadRequestError("Grams must be positive");
  
    let session, lockKey, lockToken;
    try {
      // 1️⃣ Lock
      lockKey = `lock:buy-asset:${userId}`;
      lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
      if (!lockToken) throw new ConflictError("Another asset operation in progress");
  
      // 2️⃣ Start transaction
      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);
  
      // 3️⃣ Idempotency check
      if (idempotencyKey) {
        const cached = await this.idempotencyService.getJSON(idempotencyKey);
        if (cached) return cached;
      }
  
      // 4️⃣ Load wallet
      const wallet = await this.mongoService.findOneRecord(
        this.Wallet,
        { userId },
        { session }
      );
      if (!wallet) throw new NotFoundError("Wallet not found");
  
      // 5️⃣ Load product
      const product = await this.mongoService.findOneRecord(
        this.Product,
        { _id: productId },
        { session }
      );
  
      if (!product || !product.isActive) throw new BadRequestError("Product not available");
  
      const totalPrice = grams * product.buyPrice;
      if (wallet.balance < totalPrice) throw new BadRequestError("Insufficient balance");
  
      // 6️⃣ Find or create user asset
      let asset = await this.mongoService.findOneRecord(
        this.Asset,
        { userId, productId },
        { session }
      );
      if (!asset) {
        asset = await this.mongoService.create(
          this.Asset,
          { userId, productId, amount: 0 },
          { session }
        );
      }
  
      const walletBefore = wallet.balance;
      const assetBefore = asset.amount;
  
      // 7️⃣ Update wallet
      const updatedWallet = await this.mongoService.findOneAndUpdate(
        this.Wallet,
        { _id: wallet._id, __v: wallet.__v },
        { $inc: { balance: -totalPrice, __v: 1 } },
        { new: true, session }
      );
      if (!updatedWallet) throw new ConflictError("Wallet updated by another process");
  
      // 8️⃣ Update asset
      const updatedAsset = await this.mongoService.findOneAndUpdate(
        this.Asset,
        { _id: asset._id, __v: asset.__v },
        { $inc: { amount: grams, __v: 1 } },
        { new: true, session }
      );
      if (!updatedAsset) throw new ConflictError("Asset updated by another process");
  
      // 9️⃣ Create transaction
      await this.mongoService.create(
        this.Transaction,
        {
          userId,
          productId,
          type: "BUY",
          status: "SUCCESS",
          amount: grams,
          price: product.buyPrice,
          refId: cryptography.trackId(),
          meta: {
            totalPrice,
            walletBefore,
            walletAfter: updatedWallet.balance,
            assetBefore,
            assetAfter: updatedAsset.amount,
          },
        },
        { session }
      );
  
      // 10️⃣ Commit
      await this.mongoService.commitTransaction(session);
  
      // 11️⃣ Save idempotency
      if (idempotencyKey) {
        await this.idempotencyService.setJSON(
          idempotencyKey,
          updatedAsset,
          60 * 60 * 24
        );
      }
  
      return updatedAsset;
    } catch (err) {
      if (session) await this.mongoService.abortTransaction(session);
      throw err;
    } finally {
      if (session) this.mongoService.endSession(session);
      if (lockKey && lockToken) await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }
  

  async sellAsset(userId, productId, grams, idempotencyKey) {
    if (grams <= 0) throw new BadRequestError("Grams must be positive");
  
    let session, lockKey, lockToken;
    try {
      // 1️⃣ Lock
      lockKey = `lock:sell-asset:${userId}`;
      lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
      if (!lockToken) throw new ConflictError("Another asset operation in progress");
  
      // 2️⃣ Start transaction
      session = await this.mongoService.startSession();
      this.mongoService.startTransaction(session);
  
      // 3️⃣ Idempotency check
      if (idempotencyKey) {
        const cached = await this.idempotencyService.getJSON(idempotencyKey);
        if (cached) return cached;
      }
  
      // 4️⃣ Find asset
      const asset = await this.mongoService.findOneRecord(
        this.Asset,
        { userId, productId },
        { session }
      );
  
      if (!asset || asset.amount < grams) {
        throw new BadRequestError("Insufficient asset balance");
      }
  
      // 5️⃣ Find wallet
      const wallet = await this.mongoService.findOneRecord(
        this.Wallet,
        { userId },
        { session }
      );
      if (!wallet) throw new NotFoundError("Wallet not found");
  
      // 6️⃣ Find product
      const product = await this.mongoService.findOneRecord(
        this.Product,
        { _id: productId },
        { session }
      );
      if (!product || !product.isActive) throw new BadRequestError("Product not available");
  
      const totalPrice = grams * product.sellPrice;
      const walletBefore = wallet.balance;
      const assetBefore = asset.amount;
  
      // 7️⃣ Update asset (optimistic lock)
      const updatedAsset = await this.mongoService.findOneAndUpdate(
        this.Asset,
        { _id: asset._id, __v: asset.__v, amount: { $gte: grams } },
        { $inc: { amount: -grams, __v: 1 } },
        { new: true, session }
      );
  
      if (!updatedAsset) {
        throw new ConflictError(
          "Asset updated by another process or insufficient balance"
        );
      }
  
      // 8️⃣ Update wallet
      const updatedWallet = await this.mongoService.findOneAndUpdate(
        this.Wallet,
        { _id: wallet._id, __v: wallet.__v },
        { $inc: { balance: totalPrice, __v: 1 } },
        { new: true, session }
      );
  
      if (!updatedWallet) {
        throw new ConflictError(
          "Wallet updated by another process"
        );
      }
  
      // 9️⃣ Create transaction
      await this.mongoService.create(
        this.Transaction,
        {
          userId,
          productId,
          type: "SELL",
          status: "SUCCESS",
          amount: grams,
          price: product.sellPrice,
          refId: cryptography.trackId(),
          meta: {
            totalPrice,
            walletBefore,
            walletAfter: updatedWallet.balance,
            assetBefore,
            assetAfter: updatedAsset.amount,
          },
        },
        { session }
      );
  
      // 10️⃣ Commit
      await this.mongoService.commitTransaction(session);
  
      // 11️⃣ Save idempotency
      if (idempotencyKey) {
        await this.idempotencyService.setJSON(
          idempotencyKey,
          updatedAsset,
          60 * 60 * 24
        );
      }
  
      return updatedAsset;
    } catch (err) {
      if (session) await this.mongoService.abortTransaction(session);
      throw err;
    } finally {
      if (session) this.mongoService.endSession(session);
      if (lockKey && lockToken) await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }
  
}
