import mongoose from "mongoose";
import { CommodityTypeValues, CommodityType, KaratValues, Unit, UnitValues } from "../enum/commodityEnums.js";

const productSchema = new mongoose.Schema(
  {
    type: { type: String, enum: CommodityTypeValues, required: true },
    karat: {
      type: Number,
      enum: KaratValues,
      required: function () {
        return this.type === CommodityType.GOLD;
      },
    },
    unit: { type: String, enum: UnitValues, default: Unit.GRAM },

    buyPrice: { type: Number, required: true },  
    sellPrice: { type: Number, required: true }, 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ type: 1, karat: 1 }, { unique: true });

export default mongoose.model("Product", productSchema);