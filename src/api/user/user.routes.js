import express from "express";

import { userController } from "./user.controller.js";
import { uploadFile } from "#middlewares/upload.middleware.js";

export const userRoutes = express.Router();

userRoutes
  .get("/me", userController.getMe)
  .patch("/me", uploadFile, userController.updateMe)
  .delete("/me", userController.deleteMe);
