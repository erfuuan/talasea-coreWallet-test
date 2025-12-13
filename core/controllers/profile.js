import User from "../models/users.js";
import responseBuilder from "../utils/responseBuilder.js";
import ruleValidator from "../validators/index.js";
import Joi from "joi";

export default {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password -_id")
      if (!user) {
        return responseBuilder.notFound(res, null, "User not found");
      }
      return responseBuilder.success(res, user);
    } catch (err) {
      console.error("Get profile error:", err);
      return responseBuilder.internalErr(res);
    }
  },

  async updateProfile(req, res) {
    try {
      const newData = await ruleValidator.profile.schema.validateAsync(req.body)

      if (newData.phone) {
        const exists = await User.findOne({ phone: newData.phone, _id: { $ne: req.user.id } });
        if (exists) {
          return responseBuilder.conflict(res, null, "Phone already in use");
        }
      }

      const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
      }).select("-password -_id");

      if (!user) {
        return responseBuilder.notFound(res, null, "User not found");
      }

      return responseBuilder.success(res, user);
    } catch (err) {
      if (Joi.isError(err)) {
        return responseBuilder.badRequest(res, null, err.details[0].message);
      }
      console.error("Update profile error:", err);
      return responseBuilder.internalErr(res);
    }
  },
};



