import assert from "node:assert/strict";
import test from "node:test";

import { createIngestionWorker } from "../../src/workers/ingestion.worker.js";

test("processNextJob claims and completes a queued job outside the request cycle", async () => {
  const seen = [];
  const worker = createIngestionWorker({
    workerId: "worker-test",
    jobRepository: {
      claimNextQueued: async ({ workerId }) => {
        seen.push(["claim", workerId]);
        return { _id: "job-1", document: "doc-1", user: "user-1", attempts: 1 };
      },
      complete: async ({ jobId }) => seen.push(["complete", jobId]),
      failOrRequeue: async () => seen.push(["fail"]),
    },
    documentRepository: {
      updateIngestionStatus: async ({ documentId, status, lastIngestionJob }) =>
        seen.push(["document", documentId, status, lastIngestionJob]),
    },
    aiUsageRepository: {
      create: async ({ user, document, ingestionJob, operation }) =>
        seen.push(["usage", user, document, ingestionJob, operation]),
    },
  });

  const processed = await worker.processNextJob();

  assert.equal(processed, true);
  assert.deepEqual(seen, [
    ["claim", "worker-test"],
    ["document", "doc-1", "processing", "job-1"],
    ["usage", "user-1", "doc-1", "job-1", "ingestion"],
    ["document", "doc-1", "processed", "job-1"],
    ["complete", "job-1"],
  ]);
});

test("processNextJob marks the job failed and document failed on processing errors", async () => {
  const seen = [];
  const worker = createIngestionWorker({
    workerId: "worker-test",
    jobRepository: {
      claimNextQueued: async () => ({
        _id: "job-1",
        document: "doc-1",
        user: "user-1",
      }),
      complete: async () => seen.push(["complete"]),
      failOrRequeue: async ({ jobId, errorMessage }) =>
        seen.push(["fail", jobId, errorMessage]),
    },
    documentRepository: {
      updateIngestionStatus: async ({ status }) => {
        seen.push(["document", status]);
        if (status === "processing") throw new Error("processor unavailable");
      },
    },
    aiUsageRepository: {
      create: async () => seen.push(["usage"]),
    },
  });

  const processed = await worker.processNextJob();

  assert.equal(processed, true);
  assert.deepEqual(seen, [
    ["document", "processing"],
    ["document", "failed"],
    ["fail", "job-1", "processor unavailable"],
  ]);
});

test("start and stop control polling without running work in the request cycle", async () => {
  let callback;
  let cleared = false;
  const worker = createIngestionWorker({
    intervalMs: 25,
    setIntervalFn: (fn, intervalMs) => {
      callback = fn;
      return { intervalMs };
    },
    clearIntervalFn: () => {
      cleared = true;
    },
    jobRepository: { claimNextQueued: async () => null },
    documentRepository: {},
    aiUsageRepository: {},
  });

  worker.start();
  assert.equal(typeof callback, "function");
  await callback();
  worker.stop();
  assert.equal(cleared, true);
});
