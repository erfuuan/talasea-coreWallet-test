export default class TransactionService {
  constructor({ TransactionModel, mongoService }) {
    if (!TransactionModel) throw new Error('TransactionModel is required');
    if (!mongoService) throw new Error('mongoService is required');

    this.Transaction = TransactionModel;
    this.mongoService = mongoService;
  }

  async getTransactions(userId) {
    const transactions = await this.mongoService.getAll(
      this.Transaction,
      { userId },
      {
        sort: { createdAt: -1 },
      }
    );

    return transactions;
  }
}
