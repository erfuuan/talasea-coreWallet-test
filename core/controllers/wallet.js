import responseBuilder from "../utils/responseBuilder.js";
export default class WalletController {
  constructor({ walletService }) {
    if (!walletService) {
      throw new Error("walletService is required");
    }
    this.walletService = walletService;
  }

  async getWallet(req, res, next) {
    try {
      const wallet = await this.walletService.getWallet(req.user.id);
      return responseBuilder.success(res, wallet, "Wallet retrieved successfully");
    } catch (err) {
      return next(err);
    }
  }

  async withdraw(req, res, next) {
    try {
      const { amount } = req.body;
      const idempotencyKey = req.idempotencyKey || null;

      const updatedWallet = await this.walletService.withdraw(
        req.user.id,
        amount,
        idempotencyKey
      );
      return responseBuilder.success(res, updatedWallet, "Withdraw successful");
    } catch (err) {
      return next(err);
    }
  }

  async deposit(req, res, next) {
    try {
      const { amount } = req.body;
      const idempotencyKey = req.idempotencyKey || null;
      const updatedWallet = await this.walletService.deposit(
        req.user.id,
        amount,
        idempotencyKey
      );

      return responseBuilder.success(res, updatedWallet, "Deposit successful");
    } catch (err) {
      return next(err);
    }
  }

}
