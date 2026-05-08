import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const MESSAGE_ROLES = ["user", "assistant", "system", "tool"];

const MessageSchema = new Schema(
  {
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: "Conversation",
      required: [true, "Conversation is required"],
      index: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    role: {
      type: String,
      enum: MESSAGE_ROLES,
      required: [true, "Role is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "messages",
  },
);

MessageSchema.index({ conversation: 1, createdAt: 1 });
MessageSchema.index({ user: 1, createdAt: -1 });

export const MessageModel = model("Message", MessageSchema);
