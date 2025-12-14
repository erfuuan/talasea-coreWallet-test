import RedisService from "./redis.js";
import connections from "../connections/index.js";
import RedisDB from "../config/redisDb.js";

const redisMain = new RedisService(connections.redisManager.getService(RedisDB.LOCK));

export default {
  redisMain,
  // mongoMain,
};
