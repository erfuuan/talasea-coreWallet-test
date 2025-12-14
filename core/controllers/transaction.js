import responseBuilder from '../utils/responseBuilder.js';

export default class TransactionController {
  constructor({ transactionService }) {
    if (!transactionService) {
      throw new Error('transactionService is required');
    }
    this.transactionService = transactionService;
  }

  async getTransactions(req, res, next) {
    try {
      const transactions = await this.transactionService.getTransactions(
        req.user.id
      );
      return responseBuilder.success(res, transactions);
    } catch (err) {
      return next(err);
    }
  }
}
