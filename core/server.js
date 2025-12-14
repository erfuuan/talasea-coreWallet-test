#!/usr/bin/env node
import http from "node:http";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import routes from "./routers/index.js";
import responseBuilder from "./utils/responseBuilder.js";
import connections from "./connections/index.js";
import config from "./config/application.js";
import { registerErrorHandlers } from "./utils/errorHandlers.js";
import logger from "./utils/Logger.js";
import redisManager from "./connections/redis.js";
import errorHandler from "./middlewares/errorHandler.js";

registerErrorHandlers();

const app = express();
const PORT = config.port;
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 */
app.get("/api/v1/health", (req, res) => {
  responseBuilder.success(res, { status: "healthy" });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Talasea Core Wallet API Documentation",
}));

app.use("/api/v1", routes);

app.use((req, res, _) => {
  responseBuilder.notFound(res, null, "Not Found");
});

app.use(errorHandler);


async function bootstrap() {
  try {
    logger.info(`Starting server on port ${PORT} and node environment ${config.nodeEnv}`);
    
    await redisManager.connect();   
    await connections.mongodbConnection.connect();

    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

  } catch (err) {
    logger.fatal("Startup failed", err);
    process.exit(1);
  }
}

bootstrap();
