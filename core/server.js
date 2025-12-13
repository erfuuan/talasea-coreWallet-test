#!/usr/bin/env node
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import routes from "./routers/index.js";
import responseBuilder from "./utils/responseBuilder.js";
import mongodb from "./connections/mongodb.js";
import chalk from "chalk";
import config from "./config/application.js";
const app = express();
const PORT = config.port;
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/health", (req, res) => {
  responseBuilder.success(res, { status: "healthy" });
});

app.use("/api/v1", routes);

app.use((req, res, next) => {
  responseBuilder.notFound(res, null, "Not Found");
});

// --- Global Error Handler --- //
app.use((err, req, res, next) => {
  console.error(err.stack);
  responseBuilder.internalErr(res,  "Internal Server Error");
});

// --- Start Server --- //
const start = async () => {
  try {
    await mongodb.connect();

    app.listen(PORT, () => {
      console.log(chalk.green(`Server listening on port ${PORT}`));
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
