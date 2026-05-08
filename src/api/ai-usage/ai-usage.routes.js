import express from "express";

import { aiUsageController } from "./ai-usage.controller.js";

export const aiUsageRoutes = express.Router();

aiUsageRoutes.get("/", aiUsageController.listUsage);
