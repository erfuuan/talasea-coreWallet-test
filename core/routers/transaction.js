import express from 'express';
import TransactionController from '../controllers/transaction.js';
import { container } from '../container.js';

const router = express.Router();
const transactionController = new TransactionController({
  transactionService: container.transactionService,
});

/**
 * @swagger
 * /api/v1/transaction:
 *   get:
 *     summary: Get transaction history
 *     description: Retrieves the authenticated user's complete transaction history including deposits, withdrawals, asset purchases, and asset sales. Transactions are ordered by creation date (most recent first).
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionList'
 *             examples:
 *               example1:
 *                 summary: Transaction history
 *                 value:
 *                   statusCode: 200
 *                   message: "Transactions retrieved successfully"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       userId: "507f1f77bcf86cd799439011"
 *                       type: "deposit"
 *                       amount: 50000
 *                       assetType: null
 *                       grams: null
 *                       pricePerUnit: null
 *                       karat: null
 *                       balanceAfter: 1050000.50
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                     - id: "507f1f77bcf86cd799439012"
 *                       userId: "507f1f77bcf86cd799439011"
 *                       type: "buy"
 *                       amount: 26250000
 *                       assetType: "gold"
 *                       grams: 10.5
 *                       pricePerUnit: 2500000
 *                       karat: 18
 *                       balanceAfter: 1023750.50
 *                       createdAt: "2024-01-15T11:00:00.000Z"
 *                     - id: "507f1f77bcf86cd799439013"
 *                       userId: "507f1f77bcf86cd799439011"
 *                       type: "sell"
 *                       amount: 12750000
 *                       assetType: "gold"
 *                       grams: 5.0
 *                       pricePerUnit: 2550000
 *                       karat: 18
 *                       balanceAfter: 1036500.50
 *                       createdAt: "2024-01-15T12:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No transactions found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  transactionController.getTransactions.bind(transactionController)
);

export default router;
