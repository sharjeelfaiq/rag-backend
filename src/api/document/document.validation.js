import crypto from "node:crypto";
import path from "node:path";
import { randomUUID } from "node:crypto";
import createError from "http-errors";

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const ALLOWED_TYPES = {
  pdf: {
    extensions: [".pdf"],
    mimeTypes: ["application/pdf"],
  },
  docx: {
    extensions: [".docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  txt: {
    extensions: [".txt"],
    mimeTypes: ["text/plain"],
  },
  md: {
    extensions: [".md"],
    mimeTypes: ["text/markdown", "text/x-markdown"],
  },
};

const getAllowedType = ({ extension, mimeType }) => {
  return Object.entries(ALLOWED_TYPES).find(([, config]) => {
    return (
      config.extensions.includes(extension) &&
      config.mimeTypes.includes(mimeType)
    );
  })?.[0];
};

const looksLikeText = (buffer) => {
  if (!buffer.length) return false;
  if (buffer.includes(0)) return false;

  const decoded = buffer.toString("utf8");
  return !decoded.includes("\uFFFD");
};

const contentMatchesType = (fileType, buffer) => {
  if (fileType === "pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if (fileType === "docx") {
    const text = buffer.toString("latin1");
    return (
      buffer.subarray(0, 2).toString("latin1") === "PK" &&
      text.includes("[Content_Types].xml") &&
      text.includes("word/")
    );
  }
  return looksLikeText(buffer);
};

export const computeSha256 = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

export const validateDocumentFile = (file) => {
  if (!file) throw createError(400, "Document file is required");
  if (!Buffer.isBuffer(file.buffer)) {
    throw createError(400, "Document file buffer is required");
  }
  if (file.size > MAX_DOCUMENT_FILE_SIZE_BYTES) {
    throw createError(413, "File size exceeds 20MB");
  }

  const originalFileName = file.originalname ?? "";
  const extension = path.extname(originalFileName).toLowerCase();
  const mimeType = file.mimetype;
  const fileType = getAllowedType({ extension, mimeType });

  if (!fileType) {
    throw createError(400, "File type is not allowed");
  }
  if (!contentMatchesType(fileType, file.buffer)) {
    throw createError(400, "File content does not match declared type");
  }

  return {
    originalFileName,
    fileType,
    fileSize: file.size,
  };
};

export const createStoredFileName = ({ originalFileName, checksumHash }) => {
  const extension = path.extname(originalFileName).toLowerCase();
  return `${checksumHash.slice(0, 16)}-${randomUUID()}${extension}`;
};
