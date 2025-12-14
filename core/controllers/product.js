import responseBuilder from '../utils/responseBuilder.js';

export default class ProductController {
  constructor({ productService }) {
    if (!productService) {
      throw new Error('productService is required');
    }
    this.productService = productService;
  }

  async getProducts(req, res, next) {
    try {
      const { type, karat, isActive } = req.query;
      
      const filters = {};
      if (type) filters.type = type;
      if (karat) filters.karat = parseInt(karat, 10);
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const products = await this.productService.getProducts(filters);
      return responseBuilder.success(res, products);
    } catch (err) {
      return next(err);
    }
  }
}
