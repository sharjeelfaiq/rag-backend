import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const CONVERSATION_STATUSES = ["active", "archived", "deleted"];

const ConversationSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    document: {
      type: mongoose.Types.ObjectId,
      ref: "Document",
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: CONVERSATION_STATUSES,
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "conversations",
  },
);

ConversationSchema.index({ user: 1, updatedAt: -1 });
ConversationSchema.index({ user: 1, document: 1 });

export const ConversationModel = model("Conversation", ConversationSchema);
