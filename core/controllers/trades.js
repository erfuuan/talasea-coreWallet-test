import responseBuilder from '../utils/responseBuilder.js';

export default class TradesController {
  constructor({ tradesService }) {
    if (!tradesService) {
      throw new Error('tradesService is required');
    }
    this.tradesService = tradesService;
  }

  async buyCommodity(req, res, next) {
    try {
      const { commodity, amount, unit } = req.body;
      const idempotencyKey = req.idempotencyKey || null;
      const result = await this.tradesService.buyCommodity({ userId: req.user.id, commodity, amount, unit, idempotencyKey });
      return responseBuilder.success(res, result, "Commodity bought successfully");
    } catch (err) {
      return next(err);
    }
  }

  async sellCommodity(req, res, next) {


    try {
      const { commodity, amount, unit } = req.body;
      const idempotencyKey = req.idempotencyKey || null;
      const result = await this.tradesService.sellCommodity({ userId: req.user.id, commodity, amount, unit, idempotencyKey });
      return responseBuilder.success(res, result, "Commodity sold successfully");
    } catch (err) {
      return next(err);
    }



  }
}