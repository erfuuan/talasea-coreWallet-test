import Joi from "joi";

const buySchema = Joi.object({
  productId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.base": "productId must be a string",
      "string.length": "productId must be 24 characters long",
      "any.required": "productId is required",
    }),
  grams: Joi.number()
    .positive()
    .required()
    .messages({
      "number.base": "grams must be a number",
      "number.positive": "grams must be positive",
      "any.required": "grams is required",
    }),
});

const sellSchema = Joi.object({
  assetId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.base": "assetId must be a string",
      "string.length": "assetId must be 24 characters long",
      "any.required": "assetId is required",
    }),

});
export default { buySchema, sellSchema };
