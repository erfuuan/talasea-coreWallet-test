import mongoose from "mongoose";
import logger from "../utils/Logger.js";

mongoose.set("strictQuery", true);

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/talasea-corewallet?replicaSet=rs0";

const connectionOptions = {
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  writeConcern: {
    w: "majority",
    j: true,
  },
};


// Graceful shutdown
const shutdown = async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed");
  process.exit(0);
};


// Events
mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error", err);
});

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});


process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, connectionOptions);

    // 🔴 Replica Set readiness check
    const admin = mongoose.connection.db.admin();
    const status = await admin.command({ replSetGetStatus: 1 });

    if (!status || status.ok !== 1) {
      throw new Error("Replica set not ready");
    }

    logger.info("MongoDB replica set ready");
  } catch (err) {
    logger.error("MongoDB startup failed", err);
    throw err;
  }
};

export default {
  connect,
  disconnect: shutdown,
  isConnected: () => mongoose.connection.readyState === 1,
  connection: mongoose.connection,
};
