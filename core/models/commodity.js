import mongoose from "mongoose";

const CommodityPriceSchema = new mongoose.Schema({
  commodity: {
    type: String,
    enum: ["gold", "silver"],
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ["gram", "ounce", "kilogram"],
    default: "gram"
  },
  feePercent: {
    type: Number,
    required: true,
    default: 0.01
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
}, {
  timestamps: true
});

CommodityPriceSchema.index({ commodity: 1 }, { unique: true });

export default mongoose.model("CommodityPrice", CommodityPriceSchema);