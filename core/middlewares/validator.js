import responseBuilder from "../utils/responseBuilder.js";
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return responseBuilder.badRequest(res, null, error.details.map(d => d.message));
    }
    req.body = value;
    next();
  };
};

export default validateBody;
