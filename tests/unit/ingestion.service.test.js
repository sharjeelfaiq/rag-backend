import assert from "node:assert/strict";
import test from "node:test";

import { createIngestionService } from "../../src/api/ingestion/ingestion.service.js";

const makeDocumentRepository = (overrides = {}) => ({
  findByIdForUser: async () => ({ _id: "doc-1", uploadedBy: "user-1" }),
  updateIngestionStatus: async () => {},
  ...overrides,
});

const makeJobRepository = (overrides = {}) => ({
  findActiveByDocumentForUser: async () => null,
  create: async (payload) => ({ _id: "job-1", state: "queued", ...payload }),
  findByUser: async () => [],
  findByIdForUser: async () => null,
  requeueFailedForUser: async () => null,
  ...overrides,
});

test("createJob verifies document ownership and queues a Mongo ingestion job", async () => {
  const seen = [];
  const service = createIngestionService({
    documentRepository: makeDocumentRepository({
      findByIdForUser: async ({ documentId, userId }) => {
        seen.push(["findDocument", documentId, userId]);
        return { _id: documentId };
      },
      updateIngestionStatus: async (payload) => {
        seen.push([
          "updateDocument",
          payload.documentId,
          payload.status,
          payload.lastIngestionJob,
        ]);
      },
    }),
    jobRepository: makeJobRepository({
      create: async (payload) => {
        seen.push(["createJob", payload.document, payload.user, payload.state]);
        return { _id: "job-1", ...payload };
      },
    }),
  });

  const result = await service.createJob({
    documentId: "doc-1",
    userId: "user-1",
  });

  assert.equal(result.status, "success");
  assert.equal(result.data.state, "queued");
  assert.deepEqual(seen, [
    ["findDocument", "doc-1", "user-1"],
    ["createJob", "doc-1", "user-1", "queued"],
    ["updateDocument", "doc-1", "uploaded", "job-1"],
  ]);
});

test("createJob rejects active duplicate jobs for the same owned document", async () => {
  const service = createIngestionService({
    documentRepository: makeDocumentRepository(),
    jobRepository: makeJobRepository({
      findActiveByDocumentForUser: async () => ({ _id: "job-existing" }),
    }),
  });

  await assert.rejects(
    () => service.createJob({ documentId: "doc-1", userId: "user-1" }),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.equal(
        error.message,
        "Document already has an active ingestion job",
      );
      return true;
    },
  );
});

test("job reads and retry operations are ownership scoped", async () => {
  const seen = [];
  const service = createIngestionService({
    documentRepository: makeDocumentRepository(),
    jobRepository: makeJobRepository({
      findByUser: async ({ userId, state }) => {
        seen.push(["findByUser", userId, state]);
        return [];
      },
      findByIdForUser: async ({ jobId, userId }) => {
        seen.push(["findByIdForUser", jobId, userId]);
        return { _id: jobId, user: userId };
      },
      requeueFailedForUser: async ({ jobId, userId }) => {
        seen.push(["requeueFailedForUser", jobId, userId]);
        return { _id: jobId, state: "queued" };
      },
    }),
  });

  await service.listJobs({ userId: "user-1", state: "failed" });
  await service.getJob({ jobId: "job-1", userId: "user-1" });
  await service.retryJob({ jobId: "job-1", userId: "user-1" });

  assert.deepEqual(seen, [
    ["findByUser", "user-1", "failed"],
    ["findByIdForUser", "job-1", "user-1"],
    ["requeueFailedForUser", "job-1", "user-1"],
  ]);
});
