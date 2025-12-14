import responseBuilder from '../utils/responseBuilder.js';

export default class AssetController {
  constructor({ assetService }) {
    if (!assetService) {
      throw new Error('assetService is required');
    }
    this.assetService = assetService;
  }

  async getAsset(req, res, next) {
    try {
      const { type } = req.query;
      const asset = await this.assetService.getAsset(req.user.id, type);
      return responseBuilder.success(res, asset);
    } catch (err) {
      return next(err);
    }
  }

  async buyAsset(req, res, next) {
    try {
      const { type, grams, pricePerUnit, karat } = req.body;
      const idempotencyKey = req.idempotencyKey || null;

      const updatedAsset = await this.assetService.buyAsset(
        req.user.id,
        { type, grams, pricePerUnit, karat },
        idempotencyKey
      );

      return responseBuilder.success(
        res,
        updatedAsset,
        `${type} purchased successfully`
      );
    } catch (err) {
      return next(err);
    }
  }

  async sellAsset(req, res, next) {
    try {
      const { type, grams, pricePerUnit, karat } = req.body;
      const idempotencyKey = req.idempotencyKey || null;

      const updatedAsset = await this.assetService.sellAsset(
        req.user.id,
        { type, grams, pricePerUnit, karat },
        idempotencyKey
      );

      return responseBuilder.success(
        res,
        updatedAsset,
        `${type} sold successfully`
      );
    } catch (err) {
      return next(err);
    }
  }
}
