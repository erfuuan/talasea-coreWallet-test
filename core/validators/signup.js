import Joi from "joi";

const schema = Joi.object().keys({
  firstName: Joi.string().trim().min(1).required(),
  lastName: Joi.string().trim().min(1).required(),
  nationalCode: Joi.string()
    .pattern(/^\d{10}$/)
    .message("nationalCode must be 10 digits")
    .required(),
  phone: Joi.string().max(11).min(11)
    .required(),
  password: Joi.string().min(8).required(),
})

export default {
    schema,
}