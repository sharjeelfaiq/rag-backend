import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const AI_USAGE_OPERATIONS = [
  "ingestion",
  "embedding",
  "chat",
  "completion",
];

const AiUsageSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    document: {
      type: mongoose.Types.ObjectId,
      ref: "Document",
      default: null,
      index: true,
    },
    ingestionJob: {
      type: mongoose.Types.ObjectId,
      ref: "IngestionJob",
      default: null,
      index: true,
    },
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: "Conversation",
      default: null,
      index: true,
    },
    provider: {
      type: String,
      required: [true, "Provider is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    operation: {
      type: String,
      enum: AI_USAGE_OPERATIONS,
      required: [true, "Operation is required"],
      index: true,
    },
    promptTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    costUsd: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "ai_usage",
  },
);

AiUsageSchema.index({ user: 1, createdAt: -1 });
AiUsageSchema.index({ operation: 1, createdAt: -1 });

export const AiUsageModel = model("AiUsage", AiUsageSchema);
