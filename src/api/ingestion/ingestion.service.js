import createError from "http-errors";

import { documentRepository } from "#api/document/document.repository.js";
import { ingestionJobRepository } from "./ingestion-job.repository.js";

const serializeJob = (job) =>
  typeof job?.toObject === "function" ? job.toObject() : job;

export const ingestionService = {
  createJob: async ({ documentId, userId }) => {
    const document = await documentRepository.findByIdForUser({
      documentId,
      userId,
    });
    if (!document) throw createError(404, "Document not found");

    const activeJob = await ingestionJobRepository.findActiveByDocumentForUser({
      documentId,
      userId,
    });
    if (activeJob) {
      throw createError(409, "Document already has an active ingestion job");
    }

    const job = await ingestionJobRepository.create({
      document: documentId,
      user: userId,
      state: "queued",
    });

    await documentRepository.updateIngestionStatus({
      documentId,
      status: "uploaded",
      lastIngestionJob: job._id,
    });

    return {
      status: "success",
      message: "Ingestion job queued successfully",
      data: serializeJob(job),
    };
  },

  listJobs: async ({ userId, state }) => {
    const jobs = await ingestionJobRepository.findByUser({ userId, state });
    return {
      status: "success",
      message: "Ingestion jobs retrieved successfully",
      data: jobs.map(serializeJob),
    };
  },

  getJob: async ({ jobId, userId }) => {
    const job = await ingestionJobRepository.findByIdForUser({
      jobId,
      userId,
    });
    if (!job) throw createError(404, "Ingestion job not found");

    return {
      status: "success",
      message: "Ingestion job retrieved successfully",
      data: serializeJob(job),
    };
  },

  retryJob: async ({ jobId, userId }) => {
    const job = await ingestionJobRepository.requeueFailedForUser({
      jobId,
      userId,
    });
    if (!job) throw createError(404, "Failed ingestion job not found");

    return {
      status: "success",
      message: "Ingestion job requeued successfully",
      data: serializeJob(job),
    };
  },
};
