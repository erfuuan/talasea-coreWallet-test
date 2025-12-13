import cryptography from "../utils/cryptography.js";
import User from "../models/users.js";
import Models from "../models/index.js";
import responseBuilder from "../utils/responseBuilder.js";
import { buildToken } from "../utils/tokenGenerator.js";
import Joi from "joi";
import ruleValidator from "../validators/index.js";
export default {

  async signup(req, res) {
    try {
      const { firstName, lastName, nationalCode, phone, password } = await ruleValidator.signup.schema.validateAsync(req.body)
      const existing = await User.findOne({
        $or: [{ phone }, { nationalCode }],
      });

      if (existing) { return responseBuilder.conflict(res, null, "User already exists") }
      const hashedPassword = await cryptography.password.hash(password);
      const session = await Models.User.startSession();
      session.startTransaction();

      const user = await Models.User.create([{
        firstName,
        lastName,
        nationalCode,
        phone,
        password: hashedPassword,
      }], { session });

      await Models.wallet.create([{
        userId: user[0]._id,
        balance: 0,
        lockedBalance: 0
      }], { session });
      await session.commitTransaction();
      session.endSession();

      const token = buildToken(user[0]);

      return responseBuilder.created(res, {
        id: user[0]._id,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        nationalCode: user[0].nationalCode,
        phone: user[0].phone,
        role: user[0].role,
        token: "Bearer " + token,
      });
    } catch (err) {
      if (Joi.isError(err)) {
        return responseBuilder.badRequest(res, null, err.details[0].message);
      }
      console.error("Signup error:", err);
      return responseBuilder.internalErr(res);
    }
  },


  async login(req, res) {
    try {
      const { phone, password } = await ruleValidator.login.schema.validateAsync(req.body)

      const user = await User.findOne({
        phone,
      });

      if (!user) { return responseBuilder.unauthorized(res, null, "Invalid credentials") }

      const isMatch = await cryptography.password.compare(password, user.password);

      if (!isMatch) { return responseBuilder.unauthorized(res, null, "Invalid credentials") }

      const token = buildToken(user);

      return responseBuilder.success(res, {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalCode: user.nationalCode,
        phone: user.phone,
        role: user.role,
        token: "Bearer " + token,
      });
    } catch (err) {
      if (Joi.isError(err)) {
        return responseBuilder.badRequest(res, null, err.details[0].message);
      }
      console.error("Login error:", err);
      return responseBuilder.internalErr(res);
    }
  }
}