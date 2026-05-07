import mongoose from "mongoose";
import { env } from "#config/env.config.js";
import { logger } from "./logger.lib.js";
import { handlePromise } from "./promise.lib.js";

let isConnected = false;

const { DATABASE_URI } = env;

export const connectDatabase = handlePromise(async () => {
  if (isConnected) {
    logger.warn("Using existing MongoDB connection".yellow.bold);
    return;
  }

  const connection = await mongoose.connect(DATABASE_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  isConnected = !!connection.connections[0].readyState;

  const db = mongoose.connection;

  db.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  db.on("disconnected", () => {
    logger.error("MongoDB disconnected".red.bold);
    isConnected = false;
  });

  process.on("SIGINT", async () => {
    await db.close();
    logger.info("MongoDB connection closed".red.bold);
    process.exit(0);
  });
});
