import assert from "node:assert/strict";
import test from "node:test";

import { documentRepository } from "../../src/api/document/document.repository.js";
import { ingestionJobRepository } from "../../src/api/ingestion/ingestion-job.repository.js";
import { ingestionService } from "../../src/api/ingestion/ingestion.service.js";

const documentRepositoryMethods = ["findByIdForUser", "updateIngestionStatus"];

const jobRepositoryMethods = [
  "findActiveByDocumentForUser",
  "create",
  "findByUser",
  "findByIdForUser",
  "requeueFailedForUser",
];

const withIngestionDependencies = async ({
  documents = {},
  jobs = {},
  run,
}) => {
  const originalDocumentRepository = Object.fromEntries(
    documentRepositoryMethods.map((method) => [
      method,
      documentRepository[method],
    ]),
  );
  const originalJobRepository = Object.fromEntries(
    jobRepositoryMethods.map((method) => [
      method,
      ingestionJobRepository[method],
    ]),
  );

  Object.assign(documentRepository, {
    findByIdForUser: async () => ({ _id: "doc-1", uploadedBy: "user-1" }),
    updateIngestionStatus: async () => {},
    ...documents,
  });
  Object.assign(ingestionJobRepository, {
    findActiveByDocumentForUser: async () => null,
    create: async (payload) => ({ _id: "job-1", state: "queued", ...payload }),
    findByUser: async () => [],
    findByIdForUser: async () => null,
    requeueFailedForUser: async () => null,
    ...jobs,
  });

  try {
    return await run();
  } finally {
    Object.assign(documentRepository, originalDocumentRepository);
    Object.assign(ingestionJobRepository, originalJobRepository);
  }
};

test("createJob verifies document ownership and queues a Mongo ingestion job", async () => {
  const seen = [];

  await withIngestionDependencies({
    documents: {
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
    },
    jobs: {
      create: async (payload) => {
        seen.push(["createJob", payload.document, payload.user, payload.state]);
        return { _id: "job-1", ...payload };
      },
    },
    run: async () => {
      const result = await ingestionService.createJob({
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
    },
  });
});

test("createJob rejects active duplicate jobs for the same owned document", async () => {
  await withIngestionDependencies({
    jobs: {
      findActiveByDocumentForUser: async () => ({ _id: "job-existing" }),
    },
    run: async () => {
      await assert.rejects(
        () =>
          ingestionService.createJob({ documentId: "doc-1", userId: "user-1" }),
        (error) => {
          assert.equal(error.statusCode, 409);
          assert.equal(
            error.message,
            "Document already has an active ingestion job",
          );
          return true;
        },
      );
    },
  });
});

test("job reads and retry operations are ownership scoped", async () => {
  const seen = [];

  await withIngestionDependencies({
    jobs: {
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
    },
    run: async () => {
      await ingestionService.listJobs({ userId: "user-1", state: "failed" });
      await ingestionService.getJob({ jobId: "job-1", userId: "user-1" });
      await ingestionService.retryJob({ jobId: "job-1", userId: "user-1" });

      assert.deepEqual(seen, [
        ["findByUser", "user-1", "failed"],
        ["findByIdForUser", "job-1", "user-1"],
        ["requeueFailedForUser", "job-1", "user-1"],
      ]);
    },
  });
});
