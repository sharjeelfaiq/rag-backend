import express from "express";

import { healthController } from "./health.controller.js";
import { verifyAccessToken } from "#middlewares/auth.middleware.js";

export const healthRoutes = express.Router();

healthRoutes
  .get("/", healthController.checkHealth)
  .get("/details", verifyAccessToken, healthController.checkDetailedHealth);
