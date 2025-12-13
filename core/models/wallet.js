import mongoose from "mongoose";
const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    unique: true,
    index: true,
    required: true,
  },

  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },

  lockedBalance: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },

}, {
  timestamps: true
});


export default mongoose.model("Wallet", WalletSchema);