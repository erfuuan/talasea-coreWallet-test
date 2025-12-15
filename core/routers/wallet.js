import express from "express";
import WalletController from "../controllers/wallet.js";
import middlewares from "../middlewares/index.js";
import { container } from "../container.js";
import validators from "../validators/index.js";
const router = express.Router();
const walletController = new WalletController({
  walletService: container.walletService,
});

/**
 * @swagger
 * /api/v1/wallet:
 *   get:
 *     summary: Get wallet information
 *     description: Retrieves the authenticated user's wallet balance and details. Requires authentication and idempotency key.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique idempotency key for the request
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
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
 *                   example: "Wallet retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/",  walletController.getWallet.bind(walletController));

/**
 * @swagger
 * /api/v1/wallet/deposit:
 *   post:
 *     summary: Deposit money to wallet
 *     description: Adds funds to the user's wallet. Rate limited to 5 requests per 60 seconds. Requires idempotency key to prevent duplicate transactions.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique idempotency key to prevent duplicate deposits
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WalletOperationRequest'
 *           examples:
 *             example1:
 *               summary: Deposit 50,000 Rials
 *               value:
 *                 amount: 50000
 *     responses:
 *       200:
 *         description: Deposit successful
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
 *                   example: "Deposit successful"
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request - Validation error or invalid amount
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *             examples:
 *               rateLimitExceeded:
 *                 summary: Rate limit exceeded
 *                 value:
 *                   statusCode: 429
 *                   error: "too_many_requests"
 *                   message: "Too many requests, please try again later"
 */
router.post("/deposit", middlewares.rateLimiter(5, 60), middlewares.validator(validators.wallet.schema), walletController.deposit.bind(walletController));

/**
 * @swagger
 * /api/v1/wallet/withdraw:
 *   post:
 *     summary: Withdraw money from wallet
 *     description: Deducts funds from the user's wallet. Rate limited to 3 requests per 60 seconds. Requires idempotency key to prevent duplicate transactions. Will fail if insufficient balance.
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique idempotency key to prevent duplicate withdrawals
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WalletOperationRequest'
 *           examples:
 *             example1:
 *               summary: Withdraw 30,000 Rials
 *               value:
 *                 amount: 30000
 *     responses:
 *       200:
 *         description: Withdrawal successful
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
 *                   example: "Withdraw successful"
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: Bad request - Validation error, invalid amount, or insufficient balance
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
 *                   message: "Insufficient balance"
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
router.post("/withdraw", middlewares.rateLimiter(3, 60), middlewares.validator(validators.wallet.schema),  walletController.withdraw.bind(walletController));

export default router;