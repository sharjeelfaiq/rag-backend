import createError from "http-errors";

import { storageService } from "#storage/storage.service.js";
import { documentRepository } from "./document.repository.js";
import {
  computeSha256,
  createStoredFileName,
  validateDocumentFile,
} from "./document.validation.js";

const serializeDocument = (document) => {
  const data =
    typeof document?.toObject === "function" ? document.toObject() : document;
  if (!data) return data;

  return {
    ...data,
    fileUrl: storageService.getIngestionLocation(data.storageKey),
  };
};

const createDuplicateError = (existingDocument) => {
  const error = createError(409, "Document already uploaded");
  error.existingDocument = existingDocument;
  return error;
};

export const documentService = {
  uploadDocument: async ({ userId, file }) => {
    const metadata = validateDocumentFile(file);
    const checksumHash = computeSha256(file.buffer);
    const existingDocument = await documentRepository.findByChecksumForUser({
      userId,
      checksumHash,
    });

    if (existingDocument) {
      throw createDuplicateError(existingDocument);
    }

    const storedFileName = createStoredFileName({
      originalFileName: metadata.originalFileName,
      checksumHash,
    });
    const storedObject = await storageService.save({
      buffer: file.buffer,
      userId,
      fileType: metadata.fileType,
      storedFileName,
    });

    try {
      const document = await documentRepository.create({
        ...metadata,
        storedFileName: storedObject.storedFileName,
        storageKey: storedObject.storageKey,
        uploadedBy: userId,
        storageProvider: storageService.provider,
        checksumHash,
        status: "uploaded",
      });

      return {
        status: "success",
        message: "Document uploaded successfully",
        data: serializeDocument(document),
      };
    } catch (error) {
      await storageService.delete(storedObject.storageKey);
      if (error?.code === 11000) {
        const duplicateDocument =
          await documentRepository.findByChecksumForUser({
            userId,
            checksumHash,
          });
        throw createDuplicateError(duplicateDocument);
      }
      throw error;
    }
  },

  listDocuments: async (userId) => {
    const documents = await documentRepository.findByUser(userId);
    return {
      status: "success",
      message: "Documents retrieved successfully",
      data: documents.map(serializeDocument),
    };
  },

  getDocument: async ({ documentId, userId }) => {
    const document = await documentRepository.findByIdForUser({
      documentId,
      userId,
    });
    if (!document) throw createError(404, "Document not found");

    return {
      status: "success",
      message: "Document retrieved successfully",
      data: serializeDocument(document),
    };
  },

  deleteDocument: async ({ documentId, userId }) => {
    const document = await documentRepository.deleteByIdForUser({
      documentId,
      userId,
    });
    if (!document) throw createError(404, "Document not found");

    await storageService.delete(document.storageKey);
  },
};
