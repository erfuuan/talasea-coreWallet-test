import responseBuilder from '../utils/responseBuilder.js';

export default class OrderController {
  constructor({ orderService }) {
    if (!orderService) {
      throw new Error('orderService is required');
    }
    this.orderService = orderService;
  }

  async getUserOrders(req, res, next) {
    try {
      const { status, side, productId } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (side) filters.side = side;
      if (productId) filters.productId = productId;

      const orders = await this.orderService.getUserOrders(req.user.id, filters);
      return responseBuilder.success(res, orders, 'Orders retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }
}

