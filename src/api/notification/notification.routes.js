import express from "express";

import { notificationController } from "./notification.controller.js";

export const notificationRoutes = express.Router();

notificationRoutes
  .get("/me", notificationController.getMyNotifications)
  .patch("/:notiId", notificationController.updateNotificationById);
