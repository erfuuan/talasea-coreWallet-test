import Joi from "joi";
import { CommodityTypeValues, UnitValues } from "../enum/commodityEnums.js";

 const schema = Joi.object({
  commodity: Joi.string()
    .valid(...CommodityTypeValues)
    .required()
    .messages({
      "string.base": `"commodity" must be a string`,
      "any.only": `"commodity" must be one of ${CommodityTypeValues.join(" or ")}`,
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
    .valid(...UnitValues)
    .messages({
      "string.base": `"unit" must be a string`,
      "any.only": `"unit" must be one of ${UnitValues.join(", ")}`,
    }),

});


export default { schema }