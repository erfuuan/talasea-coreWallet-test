import responseBuilder from "../utils/responseBuilder.js";
import logger from "../utils/Logger.js";
export default function errorHandler(err, req, res, _) {
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      error: err.error || "error",
      message: err.message || "Sorry!, Something went wrong",
      data: err.data || null,
    });
  }
  logger.error(err);
  return responseBuilder.internalErr(res);
}
