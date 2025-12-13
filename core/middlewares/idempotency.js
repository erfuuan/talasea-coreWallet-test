import Service from "../service/index.js";
import responseBuilder from "../utils/responseBuilder.js";

export default async (req, res, next) => {
    const key = req.header("idempotency-key");
    if (!key) return responseBuilder.badRequest(res, null, "idempotency-key header is required");

    const cached = await Service.redisMain.get(key);
    if (cached) {
        const data = JSON.parse(cached);
        return responseBuilder.success(res, data);
    }
    req.idempotencyKey = key;
    next();
}