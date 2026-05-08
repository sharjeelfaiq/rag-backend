import assert from "node:assert/strict";
import test from "node:test";

import { createDocumentService } from "../../src/api/document/document.service.js";

const pdfFile = {
  originalname: "report.pdf",
  mimetype: "application/pdf",
  size: 16,
  buffer: Buffer.from("%PDF-1.7\nreport"),
};

const makeRepository = (overrides = {}) => ({
  findByChecksumForUser: async () => null,
  create: async (payload) => ({ _id: "doc-1", ...payload }),
  findByUser: async () => [],
  findByIdForUser: async () => null,
  deleteByIdForUser: async () => null,
  ...overrides,
});

const makeStorage = (overrides = {}) => {
  const calls = [];
  return {
    provider: "local",
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
  const repository = makeRepository({
    create: async (payload) => {
      createdPayload = payload;
      return { _id: "doc-1", ...payload };
    },
  });
  const storage = makeStorage();
  const service = createDocumentService({ repository, storage });

  const result = await service.uploadDocument({
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
});

test("uploadDocument rejects duplicate checksum for the same user", async () => {
  const existingDocument = { _id: "doc-existing", checksumHash: "same" };
  const storage = makeStorage();
  const service = createDocumentService({
    repository: makeRepository({
      findByChecksumForUser: async () => existingDocument,
    }),
    storage,
  });

  await assert.rejects(
    () => service.uploadDocument({ userId: "user-1", file: pdfFile }),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.deepEqual(error.existingDocument, existingDocument);
      return true;
    },
  );
  assert.deepEqual(storage.calls, []);
});

test("uploadDocument deletes stored file when metadata creation fails", async () => {
  const storage = makeStorage();
  const service = createDocumentService({
    repository: makeRepository({
      create: async () => {
        throw new Error("database failed");
      },
    }),
    storage,
  });

  await assert.rejects(
    () => service.uploadDocument({ userId: "user-1", file: pdfFile }),
    /database failed/,
  );
  assert.equal(storage.calls[0][0], "save");
  assert.equal(storage.calls[1][0], "delete");
});

test("get/list/delete operations are scoped to the authenticated owner", async () => {
  const deletedDocument = { _id: "doc-1", storageKey: "key-1" };
  const storage = makeStorage();
  const seen = [];
  const service = createDocumentService({
    repository: makeRepository({
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
    }),
    storage,
  });

  await service.listDocuments("user-1");
  await service.getDocument({ documentId: "doc-1", userId: "user-1" });
  await service.deleteDocument({ documentId: "doc-1", userId: "user-1" });

  assert.deepEqual(seen, [
    ["findByUser", "user-1"],
    ["findByIdForUser", "doc-1", "user-1"],
    ["deleteByIdForUser", "doc-1", "user-1"],
  ]);
  assert.deepEqual(storage.calls.at(-1), ["delete", "key-1"]);
});
