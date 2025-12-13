import Joi from "joi";

const schema = Joi.object({
  firstName: Joi.string().trim().min(1),
  lastName: Joi.string().trim().min(1),
  phone: Joi.string().length(11),
  password: Joi.string().min(8),
}).min(1);

export default{schema}