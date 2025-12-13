import mongoose from "mongoose";
const assetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['gold', 'silver'], required: true },
    amount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  lockedAmount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  karat: { type: Number, enum: [18, 22, 24,16,14], required: function() { return this.type === 'gold'; } }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },{ timestamps: true });

assetSchema.index({ userId: 1, type: 1, karat: 1 }, { unique: true })
export default mongoose.model('Asset', assetSchema);
