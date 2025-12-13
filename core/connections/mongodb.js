import mongoose from "mongoose";
import chalk from "chalk";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/talasea-corewallet?replicaSet=rs0";

// Connection options for Mongoose 8.x
const connectionOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log(chalk.green("✔  [success] MongoDB connected successfully"));
});

mongoose.connection.on("error", (error) => {
  console.log(chalk.red(`✗  [error] MongoDB connection error: ${error.message}`));
});

mongoose.connection.on("disconnected", () => {
  console.log(chalk.yellow("⚠  [warning] MongoDB disconnected"));
});

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log(chalk.yellow("MongoDB connection closed due to app termination"));
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log(chalk.yellow("MongoDB connection closed due to app termination"));
  process.exit(0);
});

// Connect function
const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, connectionOptions);
    return mongoose.connection;
  } catch (error) {
    console.error(chalk.red(`✗  [error] Failed to connect to MongoDB: ${error.message}`));
    throw error;
  }
};

// Disconnect function
const disconnect = async () => {
  try {
    await mongoose.connection.close();
    console.log(chalk.yellow("MongoDB connection closed gracefully"));
  } catch (error) {
    console.error(chalk.red(`✗  [error] Error closing MongoDB connection: ${error.message}`));
    throw error;
  }
};

// Check connection state
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

export default {
  connect,
  disconnect,
  isConnected,
  connection: mongoose.connection,
};

