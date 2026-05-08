import { IngestionJobModel } from "./ingestion-job.model.js";

const ACTIVE_STATES = ["queued", "processing"];

export const ingestionJobRepository = {
  create: (jobData) => IngestionJobModel.create(jobData),

  findActiveByDocumentForUser: ({ documentId, userId }) =>
    IngestionJobModel.findOne({
      document: documentId,
      user: userId,
      state: { $in: ACTIVE_STATES },
    }).exec(),

  findByUser: ({ userId, state }) =>
    IngestionJobModel.find({
      user: userId,
      ...(state ? { state } : {}),
    })
      .sort({ createdAt: -1 })
      .exec(),

  findByIdForUser: ({ jobId, userId }) =>
    IngestionJobModel.findOne({
      _id: jobId,
      user: userId,
    }).exec(),

  requeueFailedForUser: ({ jobId, userId }) =>
    IngestionJobModel.findOneAndUpdate(
      {
        _id: jobId,
        user: userId,
        state: "failed",
      },
      {
        $set: {
          state: "queued",
          lockedAt: null,
          startedAt: null,
          completedAt: null,
          failedAt: null,
          errorMessage: null,
          workerId: null,
        },
      },
      { new: true, runValidators: true },
    ).exec(),

  claimNextQueued: ({ workerId }) =>
    IngestionJobModel.findOneAndUpdate(
      { state: "queued" },
      {
        $set: {
          state: "processing",
          lockedAt: new Date(),
          startedAt: new Date(),
          workerId,
          errorMessage: null,
        },
        $inc: { attempts: 1 },
      },
      {
        new: true,
        sort: { createdAt: 1 },
        runValidators: true,
      },
    ).exec(),

  complete: ({ jobId }) =>
    IngestionJobModel.findByIdAndUpdate(
      jobId,
      {
        $set: {
          state: "completed",
          completedAt: new Date(),
          lockedAt: null,
          errorMessage: null,
        },
      },
      { new: true, runValidators: true },
    ).exec(),

  failOrRequeue: ({ jobId, attempts, maxAttempts, errorMessage }) => {
    const shouldFail = attempts >= maxAttempts;

    return IngestionJobModel.findByIdAndUpdate(
      jobId,
      {
        $set: {
          state: shouldFail ? "failed" : "queued",
          lockedAt: null,
          failedAt: shouldFail ? new Date() : null,
          errorMessage,
          workerId: null,
        },
      },
      { new: true, runValidators: true },
    ).exec();
  },
};
