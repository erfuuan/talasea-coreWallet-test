import Joi from "joi";

const schema = Joi.object({
  productId: Joi.string()
    .hex()
    .length(24) // Mongo ObjectId
    .required()
    .messages({
      "string.base": "ProductId must be a string",
      "string.length": "ProductId must be 24 characters long",
      "any.required": "ProductId is required",
    }),
  grams: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "Grams must be a number",
      "number.positive": "Grams must be positive",
      "any.required": "Grams is required",
    }),
});

export default { schema };
