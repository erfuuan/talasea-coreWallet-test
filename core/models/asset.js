import mongoose from "mongoose";
const assetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['gold', 'silver', 'bitcoin'], required: true },
    quantity: { type: Number, default: 0 },
    averagePrice: { type: Number, default: 0 }, // برای محاسبه سود/زیان
    updatedAt: { type: Date, default: Date.now }
  });
  
export default mongoose.model('Asset', assetSchema);
