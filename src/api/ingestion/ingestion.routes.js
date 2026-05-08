import express from "express";

import { ingestionController } from "./ingestion.controller.js";

export const ingestionRoutes = express.Router();

ingestionRoutes
  .post("/jobs", ingestionController.createJob)
  .get("/jobs", ingestionController.listJobs)
  .get("/jobs/:id", ingestionController.getJob)
  .post("/jobs/:id/retry", ingestionController.retryJob);
