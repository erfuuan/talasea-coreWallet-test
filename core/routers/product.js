import express from 'express';
import ProductController from '../controllers/product.js';
import { container } from '../container.js';

const router = express.Router();
const productController = new ProductController({
  productService: container.productService,
});

/**
 * @swagger
 * /api/v1/product:
 *   get:
 *     summary: Get products
 *     description: Retrieves available products (gold or silver). Can filter by type, karat, and active status. Returns list of products with their buy and sell prices.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [gold, silver]
 *         description: Filter products by type (optional)
 *         example: gold
 *       - in: query
 *         name: karat
 *         schema:
 *           type: number
 *           enum: [14, 16, 18, 22, 24]
 *         description: Filter gold products by karat (optional, only applies to gold)
 *         example: 18
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter products by active status (optional)
 *         example: true
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [gold, silver]
 *                       karat:
 *                         type: number
 *                         enum: [14, 16, 18, 22, 24]
 *                       unit:
 *                         type: string
 *                         example: gram
 *                       buyPrice:
 *                         type: number
 *                         example: 3200000
 *                       sellPrice:
 *                         type: number
 *                         example: 3150000
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', productController.getProducts.bind(productController));

export default router;
