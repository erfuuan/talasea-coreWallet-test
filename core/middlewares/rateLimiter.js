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
  // Support both object and positional arguments
  let points, durationValue;
  if (typeof pointsOrOptions === "object" && pointsOrOptions !== null) {
    points = pointsOrOptions.points ?? config.rateLimiter.defaultPoints;
    durationValue = pointsOrOptions.duration ?? config.rateLimiter.defaultDuration;
  } else {
    points = pointsOrOptions ?? config.rateLimiter.defaultPoints;
    durationValue = duration ?? config.rateLimiter.defaultDuration;
  }

  // Get Redis client - this will be the same instance for all limiters using RATE_LIMITER DB
  const redisClient = getRedisClient();

  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: config.rateLimiter.keyPrefix,
    points,
    duration: durationValue,
    // Ensure connection errors are handled gracefully
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
      // RateLimiterRedis throws an error when limit is exceeded
      // Check if it's a rate limit error or a connection error
      if (rejRes.msBeforeNext !== undefined) {
        // This is a rate limit exceeded error
        return responseBuilder.tooManyRequests(
          res,
          {
            retryAfter: Math.ceil((rejRes.msBeforeNext || 0) / 1000),
          },
          "Too many requests. Please try again later."
        );
      } else {
        // This might be a Redis connection error
        // Log it but allow the request to proceed (fail open)
        logger.error("Rate limiter error:", rejRes);
        next();
      }
    }
  };
};
