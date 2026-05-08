import { handlePromise } from "#lib/promise.lib.js";
import { conversationService } from "./conversation.service.js";

export const conversationController = {
  createConversation: handlePromise(async (req, res) => {
    const responseBody = await conversationService.createConversation({
      userId: req.user.id,
      title: req.body.title,
      documentId: req.body.documentId,
    });
    res.status(201).json(responseBody);
  }),

  listConversations: handlePromise(async (req, res) => {
    const responseBody = await conversationService.listConversations(
      req.user.id,
    );
    res.status(200).json(responseBody);
  }),

  createMessage: handlePromise(async (req, res) => {
    const responseBody = await conversationService.createMessage({
      conversationId: req.params.id,
      userId: req.user.id,
      role: req.body.role,
      content: req.body.content,
      metadata: req.body.metadata,
    });
    res.status(201).json(responseBody);
  }),

  listMessages: handlePromise(async (req, res) => {
    const responseBody = await conversationService.listMessages({
      conversationId: req.params.id,
      userId: req.user.id,
    });
    res.status(200).json(responseBody);
  }),
};
