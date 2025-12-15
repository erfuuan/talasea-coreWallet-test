import Joi from "joi";

 const schema = Joi.object({
  commodity: Joi.string()
    .valid("gold", "silver")
    .required()
    .messages({
      "string.base": `"commodity" must be a string`,
      "any.only": `"commodity" must be one of "gold" or "silver"`,
      "any.required": `"commodity" is required`,
    }),

    amount: Joi.number()
    .greater(0)
    .required()
    .messages({
      "number.base": `"amount" must be a number`, 
      "number.greater": `"amount" must be greater than 0`,
      "any.required": `"amount" is required`
    }),

  unit: Joi.string()
    .valid("gram", "ounce", "kilogram")
    .messages({
      "string.base": `"unit" must be a string`,
      "any.only": `"unit" must be one of "gram", "ounce" or "kilogram"`,
    }),

});


export default { schema }