import logger from "./Logger.js";
import connections from "../connections/index.js";

export const uncaughtExceptionHandler = (error) => {
  logger.fatal("Uncaught Exception - Application will exit", error, {
    type: "uncaughtException",
  });
  
  if (connections.mongodbConnection.isConnected()) {
    connections.mongodbConnection.disconnect().finally(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

export const unhandledRejectionHandler = (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error("Unhandled Promise Rejection", error, {
    type: "unhandledRejection",
    promise: promise?.toString(),
  });
};


export const registerErrorHandlers = () => {
  process.on("uncaughtException", uncaughtExceptionHandler);
  process.on("unhandledRejection", unhandledRejectionHandler);
};