export default class ProductService {
  constructor({ ProductModel, mongoService }) {
    if (!ProductModel) throw new Error('ProductModel is required');
    if (!mongoService) throw new Error('mongoService is required');

    this.Product = ProductModel;
    this.mongoService = mongoService;
  }

  async getProducts(filters = {}) {
    const { type, karat, isActive } = filters;
    
    const condition = {};
    
    if (type) {
      condition.type = type;
    }
    
    if (karat) {
      condition.karat = karat;
    }
    
    if (isActive !== undefined) {
      condition.isActive = isActive;
    }

    const products = await this.mongoService.getAll(this.Product, condition, {
      sort: { type: 1, karat: 1 },
    });

    return products;
  }
}
