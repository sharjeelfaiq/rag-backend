import express from "express";

import { documentController } from "./document.controller.js";
import { uploadDocumentFile } from "./document.upload.middleware.js";

export const documentRoutes = express.Router();

documentRoutes
  .post("/upload", uploadDocumentFile, documentController.uploadDocument)
  .get("/", documentController.listDocuments)
  .get("/:id", documentController.getDocument)
  .delete("/:id", documentController.deleteDocument);
