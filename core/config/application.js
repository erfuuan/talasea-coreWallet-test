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
  }

export default config;
