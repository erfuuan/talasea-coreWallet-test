import { Router } from 'express';
import TradesController from '../controllers/trades.js';
import { container } from '../container.js';
import validators from '../validators/index.js';
import middlewares from '../middlewares/index.js';
const router = Router();
const tradesController = new TradesController({
  tradesService: container.tradesService,
});

router.post("/:commodity/buy",middlewares.rateLimiter(3, 60),middlewares.validator(validators.trade.schema), tradesController.buyCommodity.bind(tradesController));
router.post("/:commodity/sell",middlewares.rateLimiter(5, 60),middlewares.validator(validators.trade.schema), tradesController.sellCommodity.bind(tradesController));

export default router;