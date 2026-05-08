import createError from "http-errors";

import { documentRepository } from "./document.repository.js";
import {
  computeSha256,
  createStoredFileName,
  validateDocumentFile,
} from "./document.validation.js";
import { storageService } from "#storage/storage.service.js";

const serializeDocument = (document, storage) => {
  const data =
    typeof document?.toObject === "function" ? document.toObject() : document;
  if (!data) return data;

  return {
    ...data,
    fileUrl: storage.getIngestionLocation(data.storageKey),
  };
};

const createDuplicateError = (existingDocument) => {
  const error = createError(409, "Document already uploaded");
  error.existingDocument = existingDocument;
  return error;
};

export const createDocumentService = ({ repository, storage }) => ({
  uploadDocument: async ({ userId, file }) => {
    const metadata = validateDocumentFile(file);
    const checksumHash = computeSha256(file.buffer);
    const existingDocument = await repository.findByChecksumForUser({
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
    const storedObject = await storage.save({
      buffer: file.buffer,
      userId,
      fileType: metadata.fileType,
      storedFileName,
    });

    try {
      const document = await repository.create({
        ...metadata,
        storedFileName: storedObject.storedFileName,
        storageKey: storedObject.storageKey,
        uploadedBy: userId,
        storageProvider: storage.provider,
        checksumHash,
        status: "uploaded",
      });

      return {
        status: "success",
        message: "Document uploaded successfully",
        data: serializeDocument(document, storage),
      };
    } catch (error) {
      await storage.delete(storedObject.storageKey);
      if (error?.code === 11000) {
        const duplicateDocument = await repository.findByChecksumForUser({
          userId,
          checksumHash,
        });
        throw createDuplicateError(duplicateDocument);
      }
      throw error;
    }
  },

  listDocuments: async (userId) => {
    const documents = await repository.findByUser(userId);
    return {
      status: "success",
      message: "Documents retrieved successfully",
      data: documents.map((document) => serializeDocument(document, storage)),
    };
  },

  getDocument: async ({ documentId, userId }) => {
    const document = await repository.findByIdForUser({ documentId, userId });
    if (!document) throw createError(404, "Document not found");

    return {
      status: "success",
      message: "Document retrieved successfully",
      data: serializeDocument(document, storage),
    };
  },

  deleteDocument: async ({ documentId, userId }) => {
    const document = await repository.deleteByIdForUser({
      documentId,
      userId,
    });
    if (!document) throw createError(404, "Document not found");

    await storage.delete(document.storageKey);
  },
});

export const documentService = createDocumentService({
  repository: documentRepository,
  storage: storageService,
});
