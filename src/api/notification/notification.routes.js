import express from "express";

import { notificationController } from "./notification.controller.js";

export const notificationRoutes = express.Router();

notificationRoutes
  .get("/:userId", notificationController.getNotificationsByUserId)
  .patch("/:notiId", notificationController.updateNotificationById);
