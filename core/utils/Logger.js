import winston from "winston";
import path from "path";
import fs from "fs";
import config from "../config/application.js";

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let log = `${timestamp} ${level}`;
    if (context) {
      log += ` [${context}]`;
    }
    log += `: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);


class Logger {
  static instance = null;
  winstonLogger;

  context = null;

  constructor(options = {}) {
    if (Logger.instance) {
      return Logger.instance;
    }

    const {
      level = config.logger?.minLevel || (config.nodeEnv === "production" ? "info" : "debug"),
      enableConsole = config.logger?.enableConsole !== false,
      enableFile = config.logger?.enableFile || config.nodeEnv === "production",
      logDir = config.logger?.logDir || path.join(process.cwd(), "logs"),
    } = options;

    const transports = [];

    if (enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          level: level,
        })
      );
    }

    if (enableFile) {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Separate files for each level
      const levels = ["error", "warn", "info", "debug"];
      levels.forEach((logLevel) => {
        transports.push(
          new winston.transports.File({
            filename: path.join(logDir, `${logLevel}.log`),
            level: logLevel,
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          })
        );
      });

      // Combined log file
      transports.push(
        new winston.transports.File({
          filename: path.join(logDir, "combined.log"),
          format: fileFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );
    }

    // Create Winston logger
    this.winstonLogger = winston.createLogger({
      level: level,
      format: fileFormat,
      transports: transports,
      exitOnError: false,
    });

    Logger.instance = this;
  }


  static getInstance(options = {}) {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  setContext(context) {
    this.context = context;
    return this;
  }


  clearContext() {
    this.context = null;
    return this;
  }

  _addContext(meta = {}) {
    if (this.context) {
      return { ...meta, context: this.context };
    }
    return meta;
  }


  debug(message, meta = {}) {
    this.winstonLogger.debug(message, this._addContext(meta));
  }

  info(message, meta = {}) {
    this.winstonLogger.info(message, this._addContext(meta));
  }


  warn(message, meta = {}) {
    this.winstonLogger.warn(message, this._addContext(meta));
  }


  error(message, error = {}, meta = {}) {
    const errorMeta = {
      ...this._addContext(meta),
    };

    if (error instanceof Error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === "object" && error !== null) {
      errorMeta.error = error;
    }

    this.winstonLogger.error(message, errorMeta);
  }

  fatal(message, error = {}, meta = {}) {
    const errorMeta = {
      ...this._addContext(meta),
      severity: "fatal",
    };

    if (error instanceof Error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === "object" && error !== null) {
      errorMeta.error = error;
    }

    this.winstonLogger.error(message, errorMeta);
  }


  child(context) {
    const childLogger = Object.create(this);
    childLogger.context = context;
    return childLogger;
  }
}

// Create and export singleton instance
const logger = Logger.getInstance({
  level: config.logger.minLevel,
  enableConsole: config.logger.enableConsole,
  enableFile: config.logger.enableFile,
  logDir: config.logger.logDir,
});

export default logger;
