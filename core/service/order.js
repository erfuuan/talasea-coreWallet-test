export default class OrderService {
  constructor({ OrderModel, mongoService }) {
    if (!OrderModel) throw new Error('OrderModel is required');
    if (!mongoService) throw new Error('mongoService is required');

    this.Order = OrderModel;
    this.mongoService = mongoService;
  }

  async getUserOrders(userId, filters = {}) {
    const query = { userId };

    // Optional filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.side) {
      query.side = filters.side;
    }
    if (filters.productId) {
      query.productId = filters.productId;
    }

    const orders = await this.mongoService.getAll(this.Order, query, {
      sort: { createdAt: -1 }, // Most recent first
      populate: [
        { path: 'productId', select: 'name type buyPrice sellPrice' },
      ],
    });

    return orders;
  }
}

