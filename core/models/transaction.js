import mongoose from "mongoose";
import { TransactionTypeValues, TransactionStatusValues, TransactionStatus } from "../enum/transactionEnums.js";

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
    enum: TransactionTypeValues,
  },
  status: {
    type: String,
    enum: TransactionStatusValues,
    default: TransactionStatus.PENDING,
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