import express from "express";

import { userController } from "./user.controller.js";

export const userRoutes = express.Router();

userRoutes
  .get("/me", userController.getMe)
  .patch("/me", userController.updateMe)
  .delete("/me", userController.deleteMe);
