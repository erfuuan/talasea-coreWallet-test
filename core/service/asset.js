import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { OrderSide, OrderType, OrderStatus } from '../enum/orderEnums.js';

export default class AssetService {
  constructor({
    AssetModel,
    WalletModel,
    TransactionModel,
    ProductModel,
    OrderModel,
    mongoService,
    redisLockService,
    idempotencyService,
  }) {
    this.Asset = AssetModel;
    this.Wallet = WalletModel;
    this.Transaction = TransactionModel;
    this.Product = ProductModel;
    this.Order = OrderModel;
    this.mongoService = mongoService;
    this.redisLockService = redisLockService;
    this.idempotencyService = idempotencyService;
  }

  async getAsset(userId) {
    const asset = await this.mongoService.findOneRecord(this.Asset, {
      userId,

    });

    if (!asset) {
      return {}
    }

    return asset;
  }

  async buyAsset(userId, productId, grams, idempotencyKey) {
    if (grams <= 0) {
      throw new BadRequestError("Grams must be positive");
    }

    const lockKey = `lock:buy-asset:${userId}`;
    const lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
    if (!lockToken) {
      throw new ConflictError("Another operation in progress");
    }
    const session = await this.mongoService.startSession();
    this.mongoService.startTransaction(session);
    let lockedProduct = null;
    try {
      const wallet = await this.mongoService.findOneRecord(
        this.Wallet,
        { userId },
        { session }
      );
      if (!wallet) throw new NotFoundError("Wallet not found");

      lockedProduct = await this.mongoService.findOneAndUpdate(
        this.Product,
        { _id: productId, isActive: true },
        { $set: { isActive: false } },
        { new: true, session }
      );

      if (!lockedProduct) {
        throw new ConflictError("Product is already locked or unavailable");
      }

      const totalPrice = grams * lockedProduct.buyPrice;
      if (wallet.balance < totalPrice) {
        throw new BadRequestError("Insufficient balance");
      }

      // 3️⃣ Lock wallet balance
      const updatedWallet = await this.mongoService.findOneAndUpdate(
        this.Wallet,
        {
          _id: wallet._id,
          balance: { $gte: totalPrice },
        },
        {
          $inc: {
            balance: -totalPrice,
            lockedBalance: totalPrice,
          },
        },
        { new: true, session }
      );

      if (!updatedWallet) {
        throw new ConflictError("Wallet balance lock failed");
      }

      // 4️⃣ Create order (PENDING)
      const order = await this.mongoService.create(
        this.Order,
        {
          userId,
          productId,
          side: OrderSide.BUY,
          type: OrderType.PHYSICAL,
          grams,
          pricePerUnit: lockedProduct.buyPrice,
          totalPrice,
          status: OrderStatus.PENDING,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 min
        },
        { session }
      );

      await this.mongoService.commitTransaction(session);

      if (idempotencyKey) {
        await this.idempotencyService.setJSON(idempotencyKey, order, 86400);
      }
      return order;
    } catch (err) {
      await this.mongoService.abortTransaction(session);
      // 🔓 unlock product if failed
      if (lockedProduct) {
        await this.mongoService.findOneAndUpdate(
          this.Product,
          { _id: lockedProduct._id },
          { $set: { isActive: true } }
        );
      }
      throw err;
    } finally {
      this.mongoService.endSession(session);
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }


  async sellAsset(userId, assetId, idempotencyKey) {

    const lockKey = `lock:sell-asset:${userId}`;
    const lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
    if (!lockToken) {
      throw new ConflictError("Another operation in progress");
    }

    const session = await this.mongoService.startSession();
    this.mongoService.startTransaction(session);
    try {
      const asset = await this.mongoService.findOneRecord(
        this.Asset,
        { userId, _id: assetId },
        { session }
      );
      if (!asset) {
        throw new BadRequestError("Insufficient asset balance");
      }

      const product = await this.mongoService.findById(
        this.Product,
        asset.productId,
        { session }
      );

      if (!product || product.isActive) {
        throw new BadRequestError("Product not available");
      }

      const deleteResult = await this.Asset.deleteOne(
        { _id: asset._id },
        { session }
      );

      if (!deleteResult.deletedCount) {
        throw new ConflictError("Asset deletion failed");
      }

      await this.mongoService.findOneAndUpdate(
        this.Product,
        { _id: product._id },
        { $set: { isActive: true } },
        { session }
      );

      const order = await this.mongoService.create(
        this.Order,
        {
          userId,
          productId: asset.productId,
          side: OrderSide.SELL,
          type: OrderType.PHYSICAL,
          grams: asset.amount,
          pricePerUnit: product.sellPrice,
          totalPrice: asset.amount * product.sellPrice,
          status: OrderStatus.PENDING,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        },
        { session }
      );

      await this.mongoService.commitTransaction(session);

      if (idempotencyKey) {
        await this.idempotencyService.setJSON(idempotencyKey, order, 86400);
      }

      return order;
    } catch (err) {
      await this.mongoService.abortTransaction(session);
      throw err;
    } finally {
      this.mongoService.endSession(session);
      await this.redisLockService.releaseLock(lockKey, lockToken);
    }
  }




}