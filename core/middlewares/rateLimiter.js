import { RateLimiterRedis } from "rate-limiter-flexible";
import redisManager from "../connections/redis.js";
import responseBuilder from "../utils/responseBuilder.js";
import RedisDB from "../enum/redisDbEnum.js";
import config from "../config/application.js";
import logger from "../utils/Logger.js";

const getRedisClient = () => {
  const redisService = redisManager.getService(RedisDB.RATE_LIMITER);
  return redisService.client;
};

export default (pointsOrOptions = config.rateLimiter.defaultPoints, duration = config.rateLimiter.defaultDuration) => {
  let points, durationValue;
  if (typeof pointsOrOptions === "object" && pointsOrOptions !== null) {
    points = pointsOrOptions.points ?? config.rateLimiter.defaultPoints;
    durationValue = pointsOrOptions.duration ?? config.rateLimiter.defaultDuration;
  } else {
    points = pointsOrOptions ?? config.rateLimiter.defaultPoints;
    durationValue = duration ?? config.rateLimiter.defaultDuration;
  }

  const redisClient = getRedisClient();

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: config.rateLimiter.keyPrefix,
    points,
    duration: durationValue,
    execEvenly: false,
  });

  return async (req, res, next) => {
    if (!req.user?.id) {
      return responseBuilder.unauthorized(res, null, "Unauthorized");
    }

    const key = `${req.user.id}:${req.idempotencyKey ?? req.originalUrl}`;

    try {
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      if (rejRes.msBeforeNext !== undefined) {
        return responseBuilder.tooManyRequests(
          res,
          {
            retryAfter: Math.ceil((rejRes.msBeforeNext || 0) / 1000),
          },
          "Too many requests. Please try again later."
        );
      } else {
        logger.error("Rate limiter error:", rejRes);
        next();
      }
    }
  };
};
