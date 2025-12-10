import Joi from "joi";
import responseBuilder from "../utils/responseBuilder.js";

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1),
  lastName: Joi.string().trim().min(1),
  phone: Joi.string().length(11),
  email: Joi.string().email(),
  password: Joi.string().min(8),
}).min(1); // require at least one field

export const validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    return responseBuilder.badRequest(res, null, message);
  }

  return next();
};

