import mongoose from "mongoose";

const UserAssetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
    index: true
  },

  assets: {
    gold: {
      weight: {
        type: Number, 
        default: 0
      },
      unit: {
        type: String,
        default: "gram"
      }
    },

    silver: {
      weight: {
        type: Number, 
        default: 0
      },
      unit: {
        type: String,
        default: "gram"
      }
    }
  }

}, { timestamps: true });

export default mongoose.model("UserAsset", UserAssetSchema);
