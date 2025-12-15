import responseBuilder from "../utils/responseBuilder.js";
import redisManager from "../connections/redis.js";
import RedisDB from "../enum/redisDbEnum.js";
import logger from "../utils/Logger.js";

const getRedisClient = () => {
    const redisService = redisManager.getService(RedisDB.IDEMPOTENCY);
    return redisService.client;
};

const redisClient = getRedisClient();

export default async (req, res, next) => {

    const allowedGetRoutes = [
        "/api/v1/wallet",
        "/api/v1/asset",
    ];
    if (
        req.method === "GET" &&
        allowedGetRoutes.some(route => req.originalUrl.includes(route))
    ) {
        return next();
    }
    const key = req.header("idempotency-key");
    if (!key) return responseBuilder.badRequest(res, null, "idempotency-key header is required");

    const cached = await redisClient.get(key);
    if (cached) {
        logger.warn(`idempotency key found in cache: ${key}`);
        const data = JSON.parse(cached);
        return responseBuilder.success(res, data);
    }
    req.idempotencyKey = key;
    next();
}