import WalletService from './service/wallet.js';
import AuthService from './service/auth.js';
import ProfileService from './service/profile.js';
import TransactionService from './service/transaction.js';
import AssetService from './service/asset.js';
import ProductService from './service/product.js';
import MongoService from './repository/mongo.js';
import redisManager from './connections/redis.js';
import RedisDB from './enum/redisDbEnum.js';

import WalletModel from './models/wallet.js';
import TransactionModel from './models/transaction.js';
import UserModel from './models/users.js';
import AssetModel from './models/asset.js';
import ProductModel from './models/product.js';
import TradesService from './service/trade.js';
import CommodityModel from './models/commodity.js';
import OnlineAssetModel from './models/onlineAsset.js';
import OrderModel from './models/order.js';
const mongoService = new MongoService();

export const container = {
  tradesService: new TradesService({
    CommodityModel,
    TransactionModel,
    WalletModel,
    OnlineAssetModel,
    mongoService,
    redisLockService: redisManager.getService(RedisDB.LOCK),
    idempotencyService: redisManager.getService(RedisDB.IDEMPOTENCY),
  }),
  walletService: new WalletService({
    WalletModel,
    TransactionModel,
    mongoService,
    redisLockService: redisManager.getService(RedisDB.LOCK),
    idempotencyService: redisManager.getService(RedisDB.IDEMPOTENCY),
  }),
  authService: new AuthService({
    UserModel,
    WalletModel,
    mongoService,
  }),
  profileService: new ProfileService({
    UserModel,
    mongoService,
  }),
  transactionService: new TransactionService({
    TransactionModel,
    mongoService,
  }),
  assetService: new AssetService({
    AssetModel,
    WalletModel,
    TransactionModel,
    ProductModel,
    OrderModel,
    mongoService,
    redisLockService: redisManager.getService(RedisDB.LOCK),
    idempotencyService: redisManager.getService(RedisDB.IDEMPOTENCY),
  }),
  productService: new ProductService({
    ProductModel,
    mongoService,
  }),
};

