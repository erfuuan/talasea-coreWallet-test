import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["gold", "silver"], required: true },
    karat: {
      type: Number,
      enum: [14, 16, 18, 22, 24],
      required: function () {
        return this.type === "gold";
      },
    },
    unit: { type: String, default: "gram" },

    buyPrice: { type: Number, required: true },  
    sellPrice: { type: Number, required: true }, 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ type: 1, karat: 1 }, { unique: true });

export default mongoose.model("Product", productSchema);
