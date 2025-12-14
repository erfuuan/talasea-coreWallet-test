import mongoose from "mongoose";
const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  productId: { type: mongoose.Types.ObjectId, ref: "Product", required: true },
  type: {
    type: String,
    enum: [
      "DEPOSIT",
      "WITHDRAW",
      "BUY_GOLD",
      "SELL_GOLD"
    ],
    required: true,
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