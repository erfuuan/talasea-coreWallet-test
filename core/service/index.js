import RedisService from "./redis.js";
import MongoService from "./mongo.js";
import { redisServer } from "../connections/redis.js";
import Models from "../models/index.js";

const redisMain = new RedisService(redisServer);
const mongoMain = new MongoService(Models);

export default {
  redisMain,
  mongoMain,
};
