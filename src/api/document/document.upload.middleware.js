import multer from "multer";
import createError from "http-errors";

import { MAX_DOCUMENT_FILE_SIZE_BYTES } from "./document.validation.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_DOCUMENT_FILE_SIZE_BYTES,
    files: 1,
  },
}).single("document");

export const mapDocumentUploadError = (error) => {
  if (!error) return null;
  if (error.name !== "MulterError") return error;
  if (error.code === "LIMIT_FILE_SIZE") {
    return createError(413, "File size exceeds 20MB");
  }
  return createError(400, "Invalid document upload");
};

export const uploadDocumentFile = (req, res, next) => {
  upload(req, res, (error) => {
    next(mapDocumentUploadError(error));
  });
};
