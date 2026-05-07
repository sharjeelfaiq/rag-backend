import { Server as SocketIOServer } from "socket.io";

import { logger } from "#lib/logger.lib.js";
import { env } from "#config/env.config.js";
import { httpServer } from "./app.js";

const { FRONTEND_URL } = env;

const createSocketServer = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: FRONTEND_URL,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`socket -> (socket id: ${socket.id})`);

    socket.on("connect_error", (error) => {
      logger.error(`socket -> ${error.message}`);
    });

    socket.on("error", (error) => {
      logger.error(`socket -> ${error.message}`);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`socket -> (reason: ${reason})`);
    });
  });

  return io;
};

export const io = createSocketServer(httpServer);
