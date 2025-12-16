import express from 'express';
import OrderController from '../controllers/order.js';
import { container } from '../container.js';

const router = express.Router();
const orderController = new OrderController({
  orderService: container.orderService,
});

/**
 * @swagger
 * /api/v1/order:
 *   get:
 *     summary: Get user orders
 *     description: Retrieves the authenticated user's orders. Can filter by status, side (BUY/SELL), and productId. Returns orders sorted by creation date (most recent first).
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELED, FAILED]
 *         description: Filter orders by status (optional)
 *         example: PENDING
 *       - in: query
 *         name: side
 *         schema:
 *           type: string
 *           enum: [BUY, SELL]
 *         description: Filter orders by side (optional)
 *         example: BUY
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filter orders by product ID (optional)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                   example: "Orders retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       productId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           type:
 *                             type: string
 *                           buyPrice:
 *                             type: number
 *                           sellPrice:
 *                             type: number
 *                       side:
 *                         type: string
 *                         enum: [BUY, SELL]
 *                       type:
 *                         type: string
 *                         enum: [PHYSICAL]
 *                       grams:
 *                         type: number
 *                       pricePerUnit:
 *                         type: number
 *                       totalPrice:
 *                         type: number
 *                       status:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELED, FAILED]
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       confirmedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', orderController.getUserOrders.bind(orderController));

export default router;

