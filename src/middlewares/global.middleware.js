import morgan from "morgan";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import xss from "xss-clean";

import { env } from "#config/env.config.js";
import { logger } from "#lib/logger.lib.js";
import { swaggerConfig } from "#config/swagger.config.js";

const { NODE_ENV } = env;

const corsOptions = {
  origin: true,
  credentials: true,
};

const serializeError = (err, nodeEnv = NODE_ENV) => {
  const errorResponse = {
    status: err.statusCode || 500,
    message: err.message || "Something went wrong",
  };

  if (nodeEnv !== "production") {
    errorResponse.stack = err.stack;
  }

  return errorResponse;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = async (err, _, res, __) => {
  const errorResponse = serializeError(err);

  logger.error(JSON.stringify(errorResponse, null, 2));
  res.status(errorResponse.status).json(errorResponse);
};

const invalidPromiseHandler = (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
};

const applyGlobalMiddleware = (app, router) => {
  app.use(morgan("dev"));
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(helmet());
  app.use(compression());
  app.use(xss());
  app.use(mongoSanitize());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));
  app.use(router);
  app.use(invalidPromiseHandler);
  app.use(errorHandler);
};

export { applyGlobalMiddleware, serializeError };
