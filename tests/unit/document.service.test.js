import assert from "node:assert/strict";
import test from "node:test";

import { documentRepository } from "../../src/api/document/document.repository.js";
import { documentService } from "../../src/api/document/document.service.js";
import { storageService } from "../../src/storage/storage.service.js";

const pdfFile = {
  originalname: "report.pdf",
  mimetype: "application/pdf",
  size: 16,
  buffer: Buffer.from("%PDF-1.7\nreport"),
};

const repositoryMethods = [
  "findByChecksumForUser",
  "create",
  "findByUser",
  "findByIdForUser",
  "deleteByIdForUser",
];

const storageMethods = ["save", "delete", "getIngestionLocation"];

const withDocumentDependencies = async ({
  repository = {},
  storage = {},
  run,
}) => {
  const originalRepository = Object.fromEntries(
    repositoryMethods.map((method) => [method, documentRepository[method]]),
  );
  const originalStorage = Object.fromEntries(
    storageMethods.map((method) => [method, storageService[method]]),
  );
  const originalProvider = storageService.provider;

  Object.assign(documentRepository, {
    findByChecksumForUser: async () => null,
    create: async (payload) => ({ _id: "doc-1", ...payload }),
    findByUser: async () => [],
    findByIdForUser: async () => null,
    deleteByIdForUser: async () => null,
    ...repository,
  });
  Object.assign(storageService, {
    provider: "local",
    ...storage,
  });

  try {
    return await run();
  } finally {
    Object.assign(documentRepository, originalRepository);
    Object.assign(storageService, originalStorage);
    storageService.provider = originalProvider;
  }
};

const makeStorage = (overrides = {}) => {
  const calls = [];
  return {
    calls,
    save: async (payload) => {
      calls.push(["save", payload]);
      return {
        storageKey: `documents/${payload.userId}/${payload.storedFileName}`,
        storedFileName: payload.storedFileName,
      };
    },
    delete: async (storageKey) => {
      calls.push(["delete", storageKey]);
    },
    getIngestionLocation: (storageKey) => `file://${storageKey}`,
    ...overrides,
  };
};

test("uploadDocument validates, stores, and records owned metadata", async () => {
  let createdPayload;
  const storage = makeStorage();

  await withDocumentDependencies({
    repository: {
      create: async (payload) => {
        createdPayload = payload;
        return { _id: "doc-1", ...payload };
      },
    },
    storage,
    run: async () => {
      const result = await documentService.uploadDocument({
        userId: "user-1",
        file: pdfFile,
      });

      assert.equal(result.status, "success");
      assert.equal(result.data.originalFileName, "report.pdf");
      assert.equal(result.data.fileType, "pdf");
      assert.equal(result.data.fileSize, pdfFile.size);
      assert.equal(result.data.uploadedBy, "user-1");
      assert.equal(result.data.status, "uploaded");
      assert.equal(result.data.storageProvider, "local");
      assert.match(result.data.checksumHash, /^[a-f0-9]{64}$/);
      assert.equal(createdPayload.uploadedBy, "user-1");
      assert.equal(storage.calls[0][0], "save");
    },
  });
});

test("uploadDocument rejects duplicate checksum for the same user", async () => {
  const existingDocument = { _id: "doc-existing", checksumHash: "same" };
  const storage = makeStorage();

  await withDocumentDependencies({
    repository: {
      findByChecksumForUser: async () => existingDocument,
    },
    storage,
    run: async () => {
      await assert.rejects(
        () =>
          documentService.uploadDocument({ userId: "user-1", file: pdfFile }),
        (error) => {
          assert.equal(error.statusCode, 409);
          assert.deepEqual(error.existingDocument, existingDocument);
          return true;
        },
      );
      assert.deepEqual(storage.calls, []);
    },
  });
});

test("uploadDocument deletes stored file when metadata creation fails", async () => {
  const storage = makeStorage();

  await withDocumentDependencies({
    repository: {
      create: async () => {
        throw new Error("database failed");
      },
    },
    storage,
    run: async () => {
      await assert.rejects(
        () =>
          documentService.uploadDocument({ userId: "user-1", file: pdfFile }),
        /database failed/,
      );
      assert.equal(storage.calls[0][0], "save");
      assert.equal(storage.calls[1][0], "delete");
    },
  });
});

test("get/list/delete operations are scoped to the authenticated owner", async () => {
  const deletedDocument = { _id: "doc-1", storageKey: "key-1" };
  const storage = makeStorage();
  const seen = [];

  await withDocumentDependencies({
    repository: {
      findByUser: async (userId) => {
        seen.push(["findByUser", userId]);
        return [{ _id: "doc-1" }];
      },
      findByIdForUser: async ({ documentId, userId }) => {
        seen.push(["findByIdForUser", documentId, userId]);
        return { _id: documentId, uploadedBy: userId };
      },
      deleteByIdForUser: async ({ documentId, userId }) => {
        seen.push(["deleteByIdForUser", documentId, userId]);
        return deletedDocument;
      },
    },
    storage,
    run: async () => {
      await documentService.listDocuments("user-1");
      await documentService.getDocument({
        documentId: "doc-1",
        userId: "user-1",
      });
      await documentService.deleteDocument({
        documentId: "doc-1",
        userId: "user-1",
      });

      assert.deepEqual(seen, [
        ["findByUser", "user-1"],
        ["findByIdForUser", "doc-1", "user-1"],
        ["deleteByIdForUser", "doc-1", "user-1"],
      ]);
      assert.deepEqual(storage.calls.at(-1), ["delete", "key-1"]);
    },
  });
});
