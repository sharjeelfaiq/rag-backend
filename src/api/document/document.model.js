import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const DOCUMENT_STATUSES = [
  "uploaded",
  "processing",
  "processed",
  "failed",
];

export const DOCUMENT_FILE_TYPES = ["pdf", "docx", "txt", "md"];

const DocumentSchema = new Schema(
  {
    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },
    storedFileName: {
      type: String,
      required: [true, "Stored file name is required"],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
      enum: DOCUMENT_FILE_TYPES,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than zero"],
    },
    uploadedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader is required"],
      immutable: true,
    },
    uploadTimestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    storageProvider: {
      type: String,
      required: [true, "Storage provider is required"],
      trim: true,
    },
    storageKey: {
      type: String,
      required: [true, "Storage key is required"],
      trim: true,
    },
    checksumHash: {
      type: String,
      required: [true, "Checksum hash is required"],
      lowercase: true,
      trim: true,
      match: [/^[a-f0-9]{64}$/, "Checksum hash must be a sha256 hex digest"],
    },
    status: {
      type: String,
      enum: DOCUMENT_STATUSES,
      default: "uploaded",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "documents",
  },
);

DocumentSchema.index({ uploadedBy: 1, checksumHash: 1 }, { unique: true });
DocumentSchema.index({ uploadedBy: 1, createdAt: -1 });

export const DocumentModel = model("Document", DocumentSchema);
