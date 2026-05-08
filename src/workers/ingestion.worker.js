import crypto from "node:crypto";

import { aiUsageRepository } from "#api/ai-usage/ai-usage.repository.js";
import { documentRepository } from "#api/document/document.repository.js";
import { ingestionJobRepository } from "#api/ingestion/ingestion-job.repository.js";
import { env } from "#config/env.config.js";

export const createIngestionWorker = ({
  workerId = `ingestion-worker-${crypto.randomUUID()}`,
  intervalMs = 5000,
  jobRepository,
  documentRepository,
  aiUsageRepository,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval,
}) => {
  let timer = null;
  let isProcessing = false;

  const processNextJob = async () => {
    if (isProcessing) return false;
    isProcessing = true;

    const job = await jobRepository.claimNextQueued({ workerId });
    if (!job) {
      isProcessing = false;
      return false;
    }

    try {
      await documentRepository.updateIngestionStatus({
        documentId: job.document,
        status: "processing",
        lastIngestionJob: job._id,
      });
      await aiUsageRepository.create({
        user: job.user,
        document: job.document,
        ingestionJob: job._id,
        provider: "internal",
        model: "mongo-polling-ingestion-v1",
        operation: "ingestion",
        totalTokens: 0,
        metadata: {
          workerId,
        },
      });
      await documentRepository.updateIngestionStatus({
        documentId: job.document,
        status: "processed",
        lastIngestionJob: job._id,
      });
      await jobRepository.complete({ jobId: job._id });
    } catch (error) {
      await documentRepository.updateIngestionStatus({
        documentId: job.document,
        status: "failed",
        lastIngestionJob: job._id,
      });
      await jobRepository.failOrRequeue({
        jobId: job._id,
        attempts: job.attempts ?? 1,
        maxAttempts: job.maxAttempts ?? 1,
        errorMessage: error.message,
      });
    } finally {
      isProcessing = false;
    }

    return true;
  };

  return {
    processNextJob,

    start() {
      if (timer) return timer;
      timer = setIntervalFn(() => {
        processNextJob();
      }, intervalMs);
      return timer;
    },

    stop() {
      if (!timer) return;
      clearIntervalFn(timer);
      timer = null;
    },
  };
};

export const ingestionWorker = createIngestionWorker({
  intervalMs: Number(env.INGESTION_WORKER_INTERVAL_MS),
  jobRepository: ingestionJobRepository,
  documentRepository,
  aiUsageRepository,
});
