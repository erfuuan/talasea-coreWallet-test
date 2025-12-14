import mongoose from "mongoose";
const assetSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

  amount: { type: Number, default: 0, min: 0 },
  lockedAmount: { type: Number, default: 0, min: 0 },
   
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },{ timestamps: true });

assetSchema.index({ userId: 1, productId: 1 }, { unique: true })
export default mongoose.model('Asset', assetSchema);
