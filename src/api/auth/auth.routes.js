import express from "express";

import { signupDto, signinDto } from "./auth.dto.js";
import { validateDto } from "#middlewares/validation.middleware.js";
import { authController } from "./auth.controller.js";

export const authRoutes = express.Router();

authRoutes
  .post("/signup", validateDto(signupDto), authController.signup)
  .post("/signin", validateDto(signinDto), authController.signin)
  .post("/signout", authController.signOut)
  .post("/forgot-password", authController.forgotPassword)
  .patch("/reset-password", authController.resetPassword);
