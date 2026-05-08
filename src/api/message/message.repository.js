import { MessageModel } from "./message.model.js";

export const messageRepository = {
  create: (messageData) => MessageModel.create(messageData),

  findByConversation: (conversationId) =>
    MessageModel.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .exec(),
};
