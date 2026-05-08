import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const INGESTION_JOB_STATES = [
  "queued",
  "processing",
  "completed",
  "failed",
];

const IngestionJobSchema = new Schema(
  {
    document: {
      type: mongoose.Types.ObjectId,
      ref: "Document",
      required: [true, "Document is required"],
      index: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    state: {
      type: String,
      enum: INGESTION_JOB_STATES,
      default: "queued",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    lockedAt: {
      type: Date,
      default: null,
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
      trim: true,
    },
    workerId: {
      type: String,
      default: null,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "ingestion_jobs",
  },
);

IngestionJobSchema.index({ state: 1, createdAt: 1 });
IngestionJobSchema.index({ user: 1, createdAt: -1 });
IngestionJobSchema.index({ document: 1, createdAt: -1 });
IngestionJobSchema.index({ state: 1, lockedAt: 1 });

export const IngestionJobModel = model("IngestionJob", IngestionJobSchema);
