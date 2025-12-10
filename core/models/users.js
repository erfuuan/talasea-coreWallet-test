import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    firstName: {
      type: String,
      trim: true,
      required:true
    },

    lastName: {
      type: String,
      trim: true,
      required:true
    },

    nationalCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: true,
    },

    wallet:{
      type:Number,
      default:0
    }

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
