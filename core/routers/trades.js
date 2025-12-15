import { Router } from 'express';
import TradesController from '../controllers/trades.js';
import { container } from '../container.js';
import validators from '../validators/index.js';
import middlewares from '../middlewares/index.js';

const router = Router();
const tradesController = new TradesController({
  tradesService: container.tradesService,
});

/**
 * @swagger
 * /api/v1/trades/{commodity}/buy:
 *   post:
 *     summary: Buy commodity (gold or silver)
 *     description: Purchases gold or silver commodity at current market price. Rate limited to 3 requests per 60 seconds. Requires idempotency key to prevent duplicate transactions. Deducts the purchase amount (including fees) from wallet balance and adds the commodity to user's asset holdings.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commodity
 *         required: true
 *         schema:
 *           type: string
 *           enum: [gold, silver]
 *         description: Type of commodity to buy
 *         example: gold
 *       - in: header
 *         name: idempotency-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique idempotency key to prevent duplicate purchases
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TradeRequest'
 *           examples:
 *             buyGold:
 *               summary: Buy gold
 *               value:
 *                 commodity: "gold"
 *                 amount: 10
 *                 unit: "gram"
 *             buySilver:
 *               summary: Buy silver
 *               value:
 *                 commodity: "silver"
 *                 amount: 50
 *                 unit: "ounce"
 *     responses:
 *       200:
 *         description: Commodity purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Commodity bought successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TradeTransaction'
 *       400:
 *         description: Bad request - Validation error, invalid amount, insufficient balance, or invalid commodity price
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               insufficientBalance:
 *                 summary: Insufficient balance
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "Insufficient balance."
 *               invalidCommodity:
 *                 summary: Invalid commodity
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "commodity must be one of \"gold\" or \"silver\""
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Commodity price not found or wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Another buy process is already in progress or wallet was updated by another process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               concurrentProcess:
 *                 summary: Concurrent process
 *                 value:
 *                   statusCode: 409
 *                   error: "conflict"
 *                   message: "Another buy process is already in progress"
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:commodity/buy",middlewares.rateLimiter(3, 60),middlewares.validator(validators.trade.schema), tradesController.buyCommodity.bind(tradesController));

/**
 * @swagger
 * /api/v1/trades/{commodity}/sell:
 *   post:
 *     summary: Sell commodity (gold or silver)
 *     description: Sells gold or silver commodity at current market price. Rate limited to 5 requests per 60 seconds. Requires idempotency key to prevent duplicate transactions. Deducts the commodity from user's asset holdings and adds the sale amount (minus fees) to wallet balance.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commodity
 *         required: true
 *         schema:
 *           type: string
 *           enum: [gold, silver]
 *         description: Type of commodity to sell
 *         example: gold
 *       - in: header
 *         name: idempotency-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique idempotency key to prevent duplicate sales
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TradeRequest'
 *           examples:
 *             sellGold:
 *               summary: Sell gold
 *               value:
 *                 commodity: "gold"
 *                 amount: 5
 *                 unit: "gram"
 *             sellSilver:
 *               summary: Sell silver
 *               value:
 *                 commodity: "silver"
 *                 amount: 25
 *                 unit: "kilogram"
 *     responses:
 *       200:
 *         description: Commodity sold successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Commodity sold successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TradeTransaction'
 *       400:
 *         description: Bad request - Validation error, insufficient commodity balance, or invalid commodity price
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               insufficientCommodity:
 *                 summary: Insufficient commodity balance
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "Insufficient commodity balance to sell."
 *               invalidCommodity:
 *                 summary: Invalid commodity
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "commodity must be one of \"gold\" or \"silver\""
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Commodity price not found or wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Another sell process is already in progress or commodity/wallet was updated by another process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               concurrentProcess:
 *                 summary: Concurrent process
 *                 value:
 *                   statusCode: 409
 *                   error: "conflict"
 *                   message: "Another sell process is already in progress"
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:commodity/sell",middlewares.rateLimiter(5, 60),middlewares.validator(validators.trade.schema), tradesController.sellCommodity.bind(tradesController));

export default router;