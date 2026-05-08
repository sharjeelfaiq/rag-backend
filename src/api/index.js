import express from "express";

import { aiUsageRoutes } from "./ai-usage/ai-usage.routes.js";
import { authRoutes } from "./auth/auth.routes.js";
import { conversationRoutes } from "./conversation/conversation.routes.js";
import { documentRoutes } from "./document/document.routes.js";
import { emailRoutes } from "./email/email.routes.js";
import { healthRoutes } from "./health/health.routes.js";
import { ingestionRoutes } from "./ingestion/ingestion.routes.js";
import { notificationRoutes } from "./notification/notification.routes.js";
import { otpRoutes } from "./otp/otp.routes.js";
import { userRoutes } from "./user/user.routes.js";

import { verifyAccessToken } from "#middlewares/auth.middleware.js";

export const router = express.Router();
const v1Router = express.Router();

router.use("/health", healthRoutes);

router.use("/api/v1", v1Router);

v1Router.use("/auth", authRoutes);
v1Router.use("/ai/usage", verifyAccessToken, aiUsageRoutes);
v1Router.use("/conversations", verifyAccessToken, conversationRoutes);
v1Router.use("/documents", verifyAccessToken, documentRoutes);
v1Router.use("/email", emailRoutes);
v1Router.use("/ingestion", verifyAccessToken, ingestionRoutes);
v1Router.use("/notifications", verifyAccessToken, notificationRoutes);
v1Router.use("/users", verifyAccessToken, userRoutes);
v1Router.use("/otp", otpRoutes);
