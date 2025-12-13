import Joi from "joi";

const schema = Joi.object({
  amount: Joi.number().required()
})
export default { schema }