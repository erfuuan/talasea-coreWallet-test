// import {
//   BadRequestError,
//   ConflictError,
//   NotFoundError,
// } from '../utils/errors.js';
// import cryptography from '../utils/cryptography.js';
// import { TransactionType, TransactionStatus } from '../enum/transactionEnums.js';
// import { CommodityType } from '../enum/commodityEnums.js';

// export default class AssetService {
//   constructor({
//     AssetModel,
//     WalletModel,
//     TransactionModel,
//     ProductModel,
//     mongoService,
//     redisLockService,
//     idempotencyService,
//   }) {
//     if (!AssetModel) throw new Error('AssetModel is required');
//     if (!WalletModel) throw new Error('WalletModel is required');
//     if (!TransactionModel) throw new Error('TransactionModel is required');
//     if (!ProductModel) throw new Error('ProductModel is required');
//     if (!mongoService) throw new Error('mongoService is required');
//     if (!redisLockService) throw new Error('redisLockService is required');
//     if (!idempotencyService) throw new Error('idempotencyService is required');

//     this.Asset = AssetModel;
//     this.Wallet = WalletModel;
//     this.Transaction = TransactionModel;
//     this.Product = ProductModel;
//     this.mongoService = mongoService;
//     this.redisLockService = redisLockService;
//     this.idempotencyService = idempotencyService;
//   }

//   async getAsset(userId, type) {
//     const asset = await this.mongoService.findOneRecord(this.Asset, {
//       userId,
//       type,
//     });

//     if (!asset) {
//       throw new NotFoundError('Asset not found');
//     }

//     return asset;
//   }

//   async buyAsset(userId, productId, grams, idempotencyKey) {
//     if (grams <= 0) throw new BadRequestError("Grams must be positive");

//     let session, lockKey, lockToken;
//     try {
//       lockKey = `lock:buy-asset:${userId}`;
//       lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
//       if (!lockToken) throw new ConflictError("Another asset operation in progress");

//       session = await this.mongoService.startSession();
//       this.mongoService.startTransaction(session);


//       const wallet = await this.mongoService.findOneRecord(
//         this.Wallet,
//         { userId },
//         { session }
//       );
//       if (!wallet) throw new NotFoundError("Wallet not found");

//       const product = await this.mongoService.findOneRecord(
//         this.Product,
//         { _id: productId },
//         { session }
//       );

//       if (!product || !product.isActive) throw new BadRequestError("Product not available");

//       const totalPrice = grams * product.buyPrice;
//       if (wallet.balance < totalPrice) throw new BadRequestError("Insufficient balance");

//       let asset = await this.mongoService.findOneRecord(
//         this.Asset,
//         { userId, productId },
//         { session }
//       );
//       if (!asset) {
//         asset = await this.mongoService.create(
//           this.Asset,
//           { userId, productId, amount: 0 },
//           { session }
//         );
//       }

//       const walletBefore = wallet.balance;
//       const assetBefore = asset.amount;

//       const updatedWallet = await this.mongoService.findOneAndUpdate(
//         this.Wallet,
//         { _id: wallet._id, __v: wallet.__v },
//         { $inc: { balance: -totalPrice, __v: 1 } },
//         { new: true, session }
//       );
//       if (!updatedWallet) throw new ConflictError("Wallet updated by another process");

//       const updatedAsset = await this.mongoService.findOneAndUpdate(
//         this.Asset,
//         { _id: asset._id, __v: asset.__v },
//         { $inc: { amount: grams, __v: 1 } },
//         { new: true, session }
//       );
//       if (!updatedAsset) throw new ConflictError("Asset updated by another process");

//       const transactionType = product.type === CommodityType.GOLD 
//         ? TransactionType.BUY_GOLD_PHYSICAL 
//         : TransactionType.BUY_SILVER_PHYSICAL;

//       await this.mongoService.create(
//         this.Transaction,
//         {
//           userId,
//           productId,
//           type: transactionType,
//           status: TransactionStatus.SUCCESS,
//           amount: grams,
//           price: product.buyPrice,
//           refId: cryptography.trackId(),
//           meta: {
//             totalPrice,
//             walletBefore,
//             walletAfter: updatedWallet.balance,
//             assetBefore,
//             assetAfter: updatedAsset.amount,
//           },
//         },
//         { session }
//       );

//       await this.mongoService.commitTransaction(session);

//       if (idempotencyKey) {
//         await this.idempotencyService.setJSON(
//           idempotencyKey,
//           updatedAsset,
//           60 * 60 * 24
//         );
//       }

//       return updatedAsset;
//     } catch (err) {
//       if (session) await this.mongoService.abortTransaction(session);
//       throw err;
//     } finally {
//       if (session) this.mongoService.endSession(session);
//       if (lockKey && lockToken) await this.redisLockService.releaseLock(lockKey, lockToken);
//     }
//   }


//   async sellAsset(userId, productId, grams, idempotencyKey) {
//     if (grams <= 0) throw new BadRequestError("Grams must be positive");

//     let session, lockKey, lockToken;
//     try {
//       lockKey = `lock:sell-asset:${userId}`;
//       lockToken = await this.redisLockService.acquireLock(lockKey, 8000);
//       if (!lockToken) throw new ConflictError("Another asset operation in progress");

//       session = await this.mongoService.startSession();
//       this.mongoService.startTransaction(session);

//       const asset = await this.mongoService.findOneRecord(
//         this.Asset,
//         { userId, productId },
//         { session }
//       );

//       if (!asset || asset.amount < grams) {
//         throw new BadRequestError("Insufficient asset balance");
//       }

//       // 5️⃣ Find wallet
//       const wallet = await this.mongoService.findOneRecord(
//         this.Wallet,
//         { userId },
//         { session }
//       );
//       if (!wallet) throw new NotFoundError("Wallet not found");

//       // 6️⃣ Find product
//       const product = await this.mongoService.findOneRecord(
//         this.Product,
//         { _id: productId },
//         { session }
//       );
//       if (!product || !product.isActive) throw new BadRequestError("Product not available");

//       const totalPrice = grams * product.sellPrice;
//       const walletBefore = wallet.balance;
//       const assetBefore = asset.amount;

//       // 7️⃣ Update asset (optimistic lock)
//       const updatedAsset = await this.mongoService.findOneAndUpdate(
//         this.Asset,
//         { _id: asset._id, __v: asset.__v, amount: { $gte: grams } },
//         { $inc: { amount: -grams, __v: 1 } },
//         { new: true, session }
//       );

//       if (!updatedAsset) {
//         throw new ConflictError(
//           "Asset updated by another process or insufficient balance"
//         );
//       }

//       // 8️⃣ Update wallet
//       const updatedWallet = await this.mongoService.findOneAndUpdate(
//         this.Wallet,
//         { _id: wallet._id, __v: wallet.__v },
//         { $inc: { balance: totalPrice, __v: 1 } },
//         { new: true, session }
//       );

//       if (!updatedWallet) {
//         throw new ConflictError(
//           "Wallet updated by another process"
//         );
//       }

//       // 9️⃣ Create transaction
//       const transactionType = product.type === CommodityType.GOLD 
//         ? TransactionType.SELL_GOLD_PHYSICAL 
//         : TransactionType.SELL_SILVER_PHYSICAL;

//       await this.mongoService.create(
//         this.Transaction,
//         {
//           userId,
//           productId,
//           type: transactionType,
//           status: TransactionStatus.SUCCESS,
//           amount: grams,
//           price: product.sellPrice,
//           refId: cryptography.trackId(),
//           meta: {
//             totalPrice,
//             walletBefore,
//             walletAfter: updatedWallet.balance,
//             assetBefore,
//             assetAfter: updatedAsset.amount,
//           },
//         },
//         { session }
//       );

//       // 10️⃣ Commit
//       await this.mongoService.commitTransaction(session);

//       // 11️⃣ Save idempotency
//       if (idempotencyKey) {
//         await this.idempotencyService.setJSON(
//           idempotencyKey,
//           updatedAsset,
//           60 * 60 * 24
//         );
//       }

//       return updatedAsset;
//     } catch (err) {
//       if (session) await this.mongoService.abortTransaction(session);
//       throw err;
//     } finally {
//       if (session) this.mongoService.endSession(session);
//       if (lockKey && lockToken) await this.redisLockService.releaseLock(lockKey, lockToken);
//     }
//   }

// }



//?====================
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

  async getAsset(userId, type) {
    const asset = await this.mongoService.findOneRecord(this.Asset, {
      userId,
      // type,
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
      console.log({ userId, assetId })
      const asset = await this.mongoService.findOneRecord(
        this.Asset,
        { userId, _id: assetId },
        { session }
      );
      console.log({ asset })

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