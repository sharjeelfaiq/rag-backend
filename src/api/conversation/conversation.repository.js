import { ConversationModel } from "./conversation.model.js";

export const conversationRepository = {
  create: (conversationData) => ConversationModel.create(conversationData),

  findByUser: (userId) =>
    ConversationModel.find({ user: userId, status: { $ne: "deleted" } })
      .sort({ updatedAt: -1 })
      .exec(),

  findByIdForUser: ({ conversationId, userId }) =>
    ConversationModel.findOne({
      _id: conversationId,
      user: userId,
      status: { $ne: "deleted" },
    }).exec(),
};
