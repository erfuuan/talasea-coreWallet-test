import cryptography from "../utils/cryptography.js";
import logger from "../utils/Logger.js";

class RedisService {

  constructor(redisClient) {
    if (!redisClient) {
      throw new Error("Redis client is required");
    }
    this.client = redisClient;
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}`, error, { key });
      throw error;
    }
  }

  async getJSON(key) {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET JSON error for key ${key}`, error, { key });
      throw error;
    }
  }

  async set(key, value, ttl = null) {
    try {
      if (ttl) {
        return await this.client.setex(key, ttl, value);
      }
      return await this.client.set(key, value);
    } catch (error) {
      logger.error(`Redis SET error for key ${key}`, error, { key });
      throw error;
    }
  }

  async setJSON(key, value, ttl = null) {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.set(key, jsonValue, ttl);
    } catch (error) {
      logger.error(`Redis SET JSON error for key ${key}`, error, { key });
      throw error;
    }
  }

  async delete(key) {
    try {
      if (Array.isArray(key)) {
        return await this.client.del(...key);
      }
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DELETE error for key ${key}`, error, { key });
      throw error;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}`, error, { key });
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}`, error, { key });
      throw error;
    }
  }


  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL error for key ${key}`, error, { key });
      throw error;
    }
  }


  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error(`Redis KEYS error for pattern ${pattern}`, error, { pattern });
      throw error;
    }
  }



  getStatus() {
    return this.client.status;
  }


  async eval(script, numKeys, ...keysAndArgs) {
    try {
      return await this.client.eval(script, numKeys, ...keysAndArgs);
    } catch (error) {
      logger.error(`Redis EVAL error`, error);
      throw error;
    }
  }

  async acquireLock(key, ttl = 5000) {
    try {
      const token = cryptography.trackId();
      const result = await this.client.set(key, token, "PX", ttl, "NX");
      
      if (result !== "OK") {
        return null; 
      }
      
      return token;
    } catch (error) {
      logger.error(`Redis ACQUIRE LOCK error for key ${key}`, error, { key });
      throw error;
    }
  }

  async releaseLock(key, token) {
    try {
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      return await this.eval(luaScript, 1, key, token);
    } catch (error) {
      logger.error(`Redis RELEASE LOCK error for key ${key}`, error, { key });
      throw error;
    }
  }

  async ping() {
    try {
      return await this.client.ping();
    } catch (error) {
      logger.error(`Redis PING error`, error);
      throw error;
    }
  }
}

export default RedisService;

