import Joi from "joi";
import responseBuilder from "../utils/responseBuilder.js";

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  nationalCode: Joi.string()
    .pattern(/^\d{10}$/)
    .message("nationalCode must be 10 digits")
    .required(),
  phone: Joi.string().max(11).min(11)
    .required(),
  password: Joi.string().min(8).required(),
});

export const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return responseBuilder.badRequest(res, null, message);
  }

  return next();
};
