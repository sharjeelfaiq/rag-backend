import express from "express";

import { userController } from "./user.controller.js";
import { uploadFile } from "#middlewares/upload.middleware.js";
import { verifyAuthRole } from "#middlewares/auth.middleware.js";

export const userRoutes = express.Router();

userRoutes
  .get("/", userController.getAll)
  .get("/:id", userController.getById)
  .patch("/:id", uploadFile, userController.updateById)
  .delete("/:id", verifyAuthRole("admin"), userController.deleteById);
