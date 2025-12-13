import Models from "../models/index.js";
import responseBuilder from "../utils/responseBuilder.js";

export default {
  async getTransactions(req, res) {
    try {
        const transactions = await Models.transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        
      return responseBuilder.success(res, transactions);
    } catch (err) {
      console.error("Get profile error:", err);
      return responseBuilder.internalErr(res);
    }
  },


};



