import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  productId: { type: mongoose.Types.ObjectId, ref: "Product", default: null },
  type: {
    type: String,
    enum: [
      "DEPOSIT",
      "WITHDRAW",
      "BUY_GOLD_ONLINE",
      "BUY_SILVER_ONLINE",
      "SELL_GOLD_ONLINE",
      "SELL_SILVER_ONLINE",
      "BUY_GOLD_PHYSICAL",     
      "BUY_SILVER_PHYSICAL",
      "SELL_GOLD_PHYSICAL",
      "SELL_SILVER_PHYSICAL",
    ],
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING",
    index: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  refId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  meta: {
    type: Object,
    required: true,
  },

}, {
  timestamps: true
});

export default mongoose.model("Transaction", TransactionSchema);