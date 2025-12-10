import bcrypt from "bcryptjs";
import User from "../models/users.js";
import responseBuilder from "../utils/responseBuilder.js";
import { buildToken } from "../utils/tokenGenerator.js";

export default {
  async signup(req, res) {
  const { email, firstName, lastName, nationalCode, phone, password } = req.body || {};

  try {
    const existing = await User.findOne({
      $or: [{ email }, { phone }, { nationalCode }],
    });

    if (existing) {
      return responseBuilder.conflict(res, null, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      firstName,
      lastName,
      nationalCode,
      phone,
      password: hashedPassword,
    });

    const token = buildToken(user);

    return responseBuilder.created(res, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalCode: user.nationalCode,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return responseBuilder.internalErr(res);
  }
},


async login(req, res) {

  const { email, phone, password } = req.body || {};

  try {
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return responseBuilder.unauthorized(res, null, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseBuilder.unauthorized(res, null, "Invalid credentials");
    }

    const token = buildToken(user);

    return responseBuilder.success(res, {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalCode: user.nationalCode,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return responseBuilder.internalErr(res);
  }
}
}