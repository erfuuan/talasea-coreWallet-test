import Redis from "ioredis";
import logger from "../utils/Logger.js";
import RedisService from "../service/redis.js";
import config from "../config/application.js";
import RedisDB from "../config/redisDb.js";

class RedisManager {
  constructor() {
    this.clients = {}; 
    this.baseClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 1000, 3000);
      },
    });

    this.baseClient.on("connect", () => logger.info("✔ Redis connected"));
    this.baseClient.on("ready", () => logger.info("✔ Redis ready"));
    this.baseClient.on("error", (err) => logger.error("✗ Redis error:", err));
  }

  async connect() {
    if (!this.baseClient.status || this.baseClient.status === "end") {
      await this.baseClient.connect();
    }
  }

  getService(db = RedisDB.LOCK) {
    if (!this.clients[db]) {
      const client = this.baseClient.duplicate();
      client.select(db);
      this.clients[db] = new RedisService(client);
    }
    return this.clients[db];
  }
}

const redisManager = new RedisManager();
export default redisManager;
