import Joi from "joi";

const schema = Joi.object({
  type: Joi.string().valid("gold", "silver").trim().min(1).required(),
  grams: Joi.number().positive().required(),
  pricePerUnit: Joi.number().positive().required(),
  karat: Joi.number().valid(18, 22, 24, 16, 14).when("type", {
    is: "gold",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export default { schema };

