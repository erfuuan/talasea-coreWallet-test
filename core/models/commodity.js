import mongoose from "mongoose";
import { CommodityTypeValues, UnitValues, Unit } from "../enum/commodityEnums.js";

const CommodityPriceSchema = new mongoose.Schema({
  commodity: {
    type: String,
    enum: CommodityTypeValues,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: UnitValues,
    default: Unit.GRAM
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