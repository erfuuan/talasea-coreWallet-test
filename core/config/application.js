import dotenv from 'dotenv';
dotenv.config();

const config = {

    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/talasea-corewallet?replicaSet=rs0",
    
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
    jwt: {
      secret: process.env.JWT_SECRET || "dev-secret",
      expiresIn: process.env.JWT_EXPIRES_IN || "100d",
    },
    logger: {
      minLevel: (process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug")).toLowerCase(),
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== "false",
      enableFile: process.env.LOG_ENABLE_FILE === "true" || process.env.NODE_ENV === "production",
      logDir: process.env.LOG_DIR || "logs",
    },
    rateLimiter: {
      defaultPoints: parseInt(process.env.RATE_LIMITER_POINTS || "10", 10),
      defaultDuration: parseInt(process.env.RATE_LIMITER_DURATION || "60", 10),
      keyPrefix: process.env.RATE_LIMITER_KEY_PREFIX || "rate-limiter",
    },
  }

export default config;
