import User from "../models/users.js";
import responseBuilder from "../utils/responseBuilder.js";

export default {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
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
    const { firstName, lastName, phone } = req.body || {};

    if (!firstName && !lastName && !phone) {
      return responseBuilder.badRequest(res, null, "No fields provided to update");
    }

    try {
      const update = {};
      if (firstName !== undefined) update.firstName = firstName;
      if (lastName !== undefined) update.lastName = lastName;
      if (phone !== undefined) update.phone = phone;

      if (phone) {
        const exists = await User.findOne({ phone, _id: { $ne: req.user.id } });
        if (exists) {
          return responseBuilder.conflict(res, null, "Phone already in use");
        }
      }

      const user = await User.findByIdAndUpdate(req.user.id, update, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return responseBuilder.notFound(res, null, "User not found");
      }

      return responseBuilder.success(res, user);
    } catch (err) {
      console.error("Update profile error:", err);
      return responseBuilder.internalErr(res);
    }
  },
};



