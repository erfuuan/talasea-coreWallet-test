import responseBuilder from "../utils/responseBuilder.js";
import redisManager from "../connections/redis.js";
import RedisDB from "../config/redisDb.js";

const getRedisClient = () => {
    const redisService = redisManager.getService(RedisDB.IDEMPOTENCY);
    return redisService.client;
  };
  

const redisClient = getRedisClient();
  

export default async (req, res, next) => {
    const key = req.header("idempotency-key");
    if (!key) return responseBuilder.badRequest(res, null, "idempotency-key header is required");

    const cached = await redisClient.get(key);
    if (cached) {
        const data = JSON.parse(cached);
        return responseBuilder.success(res, data);
    }
    req.idempotencyKey = key;
    next();
}