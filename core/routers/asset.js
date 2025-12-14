import express from 'express';
import AssetController from '../controllers/asset.js';
import { container } from '../container.js';
import middlewares from '../middlewares/index.js';
import validateBody from '../middlewares/validator.js';
import validators from '../validators/index.js';

const router = express.Router();
const assetController = new AssetController({
  assetService: container.assetService,
});

/**
 * @swagger
 * /api/v1/asset:
 *   get:
 *     summary: Get user assets
 *     description: Retrieves the authenticated user's asset holdings. Can filter by asset type (gold or silver). Returns total grams, average price, and detailed holdings.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [gold, silver]
 *         description: Filter assets by type (optional)
 *         example: gold
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique idempotency key for the request
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
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
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Asset'
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/Asset'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Assets not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', assetController.getAsset.bind(assetController));

/**
 * @swagger
 * /api/v1/asset/buy:
 *   post:
 *     summary: Buy assets (gold or silver)
 *     description: Purchases gold or silver assets. For gold, karat is required (14, 16, 18, 22, or 24). Rate limited to 5 requests per 60 seconds. Requires idempotency key to prevent duplicate transactions. Deducts the purchase amount from wallet balance.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique idempotency key to prevent duplicate purchases
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetOperationRequest'
 *           examples:
 *             goldPurchase:
 *               summary: Buy gold (18 karat)
 *               value:
 *                 type: "gold"
 *                 grams: 10.5
 *                 pricePerUnit: 2500000
 *                 karat: 18
 *             silverPurchase:
 *               summary: Buy silver
 *               value:
 *                 type: "silver"
 *                 grams: 50.0
 *                 pricePerUnit: 800000
 *     responses:
 *       200:
 *         description: Asset purchased successfully
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
 *                   example: "gold purchased successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Bad request - Validation error, invalid amount, insufficient balance, or missing karat for gold
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
 *                   message: "Insufficient balance to purchase assets"
 *               missingKarat:
 *                 summary: Missing karat for gold
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "karat is required for gold transactions"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/buy',
  middlewares.rateLimiter(5, 60),
  validateBody(validators.asset.schema),
  assetController.buyAsset.bind(assetController)
);

/**
 * @swagger
 * /api/v1/asset/sell:
 *   post:
 *     summary: Sell assets (gold or silver)
 *     description: Sells gold or silver assets. For gold, karat is required (14, 16, 18, 22, or 24). Rate limited to 5 requests per 60 seconds. Requires idempotency key to prevent duplicate transactions. Adds the sale amount to wallet balance. Will fail if user doesn't have enough assets to sell.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique idempotency key to prevent duplicate sales
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssetOperationRequest'
 *           examples:
 *             goldSale:
 *               summary: Sell gold (18 karat)
 *               value:
 *                 type: "gold"
 *                 grams: 5.0
 *                 pricePerUnit: 2550000
 *                 karat: 18
 *             silverSale:
 *               summary: Sell silver
 *               value:
 *                 type: "silver"
 *                 grams: 25.0
 *                 pricePerUnit: 820000
 *     responses:
 *       200:
 *         description: Asset sold successfully
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
 *                   example: "gold sold successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Bad request - Validation error, insufficient assets, or missing karat for gold
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               insufficientAssets:
 *                 summary: Insufficient assets
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "Insufficient assets to sell"
 *               missingKarat:
 *                 summary: Missing karat for gold
 *                 value:
 *                   statusCode: 400
 *                   error: "bad_request"
 *                   message: "karat is required for gold transactions"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/sell',
  middlewares.rateLimiter(5, 60),
  validateBody(validators.asset.schema),
  assetController.sellAsset.bind(assetController)
);

export default router;
