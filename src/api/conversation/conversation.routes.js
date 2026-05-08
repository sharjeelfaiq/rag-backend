import express from "express";

import { conversationController } from "./conversation.controller.js";

export const conversationRoutes = express.Router();

conversationRoutes
  .post("/", conversationController.createConversation)
  .get("/", conversationController.listConversations)
  .post("/:id/messages", conversationController.createMessage)
  .get("/:id/messages", conversationController.listMessages);
