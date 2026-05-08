import createError from "http-errors";

import { documentRepository } from "#api/document/document.repository.js";
import { conversationRepository } from "./conversation.repository.js";
import { messageRepository } from "#api/message/message.repository.js";

const serialize = (data) =>
  typeof data?.toObject === "function" ? data.toObject() : data;

export const createConversationService = ({
  conversations,
  documents,
  messages,
}) => ({
  createConversation: async ({ userId, title, documentId }) => {
    if (documentId) {
      const document = await documents.findByIdForUser({ documentId, userId });
      if (!document) throw createError(404, "Document not found");
    }

    const conversation = await conversations.create({
      user: userId,
      title,
      ...(documentId ? { document: documentId } : {}),
    });

    return {
      status: "success",
      message: "Conversation created successfully",
      data: serialize(conversation),
    };
  },

  listConversations: async (userId) => {
    const conversationList = await conversations.findByUser(userId);
    return {
      status: "success",
      message: "Conversations retrieved successfully",
      data: conversationList.map(serialize),
    };
  },

  createMessage: async ({
    conversationId,
    userId,
    role,
    content,
    metadata,
  }) => {
    const conversation = await conversations.findByIdForUser({
      conversationId,
      userId,
    });
    if (!conversation) throw createError(404, "Conversation not found");

    const message = await messages.create({
      conversation: conversationId,
      user: userId,
      role,
      content,
      metadata,
    });

    return {
      status: "success",
      message: "Message created successfully",
      data: serialize(message),
    };
  },

  listMessages: async ({ conversationId, userId }) => {
    const conversation = await conversations.findByIdForUser({
      conversationId,
      userId,
    });
    if (!conversation) throw createError(404, "Conversation not found");

    const messageList = await messages.findByConversation(conversationId);
    return {
      status: "success",
      message: "Messages retrieved successfully",
      data: messageList.map(serialize),
    };
  },
});

export const conversationService = createConversationService({
  conversations: conversationRepository,
  documents: documentRepository,
  messages: messageRepository,
});
