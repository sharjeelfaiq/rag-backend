import express from "express";

import { authRoutes } from "./auth/auth.routes.js";
import { emailRoutes } from "./email/email.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { userRoutes } from "./user/user.routes.js";
import { otpRoutes } from "./otp/otp.routes.js";
import { notificationRoutes } from "./notification/notification.routes.js";

import { verifyAccessToken } from "#middlewares/auth.middleware.js";

export const router = express.Router();
const v1Router = express.Router();

router.use("/health", healthRoutes);

router.use("/api/v1", v1Router);

v1Router.use("/auth", authRoutes);
v1Router.use("/email", emailRoutes);
v1Router.use("/notifications", verifyAccessToken, notificationRoutes);
v1Router.use("/users", verifyAccessToken, userRoutes);
v1Router.use("/otp", otpRoutes);
