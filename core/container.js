import WalletService from './service/wallet.js';
import AuthService from './service/auth.js';
import ProfileService from './service/profile.js';
import TransactionService from './service/transaction.js';
import AssetService from './service/asset.js';
import ProductService from './service/product.js';
import MongoService from './repository/mongo.js';
import redisManager from './connections/redis.js';
import Models from './models/index.js';
import RedisDB from './config/redisDb.js';

import WalletModel from './models/wallet.js';
import TransactionModel from './models/transaction.js';
import UserModel from './models/users.js';
import AssetModel from './models/asset.js';
import ProductModel from './models/product.js';
import TradesService from './service/trade.js';
import CommodityModel from './models/commodity.js';
import UserAssetModel from './models/userAsset.js';
const mongoService = new MongoService(Models);

export const container = {
  tradesService: new TradesService({
    CommodityModel,
    TransactionModel,
    WalletModel,
    UserAssetModel,
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
    mongoService,
    redisLockService: redisManager.getService(RedisDB.LOCK),
    idempotencyService: redisManager.getService(RedisDB.IDEMPOTENCY),
  }),
  productService: new ProductService({
    ProductModel,
    mongoService,
  }),
};

