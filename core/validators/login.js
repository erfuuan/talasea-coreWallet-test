import Joi from "joi";
import responseBuilder from "../utils/responseBuilder.js";

const loginSchema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().length(11),
  password: Joi.string().min(8).required(),
}).or("email", "phone");

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return responseBuilder.badRequest(res, null, message);
  }

  return next();
};

