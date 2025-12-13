// middlewares/rateLimiter.js
import { RateLimiterRedis } from "rate-limiter-flexible";
import Service from "../service/index.js";
import responseBuilder from "../utils/responseBuilder.js";

export default ({ points = 10, duration = 60 }) => {
  const limiter = new RateLimiterRedis({
    storeClient: Service.redisMain,
    keyPrefix: "rate-limit",
    points,
    duration,
  });

  return async (req, res, next) => {
    if (!req.user?.id) return responseBuilder.unauthorized(res, null, "Unauthorized");

    try {
      await limiter.consume(`${req.user.id}:${req.idempotencyKey || req.originalUrl}`);
      next();
    } catch (rejRes) {
      return responseBuilder.tooManyRequests(
        res,
        null,
        "Too many requests. Please try again later.",
        Math.round((rejRes.msBeforeNext || 0) / 1000)
      );
    }
  };
};
