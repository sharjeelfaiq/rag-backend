import assert from "node:assert/strict";
import test from "node:test";

import { AiUsageModel } from "../../src/api/ai-usage/ai-usage.model.js";
import { ConversationModel } from "../../src/api/conversation/conversation.model.js";
import { MessageModel } from "../../src/api/message/message.model.js";
import { DocumentModel } from "../../src/api/document/document.model.js";
import { IngestionJobModel } from "../../src/api/ingestion/ingestion-job.model.js";

test("ai persistence models use PascalCase names and explicit collections", () => {
  assert.equal(ConversationModel.modelName, "Conversation");
  assert.equal(ConversationModel.collection.name, "conversations");
  assert.equal(MessageModel.modelName, "Message");
  assert.equal(MessageModel.collection.name, "messages");
  assert.equal(IngestionJobModel.modelName, "IngestionJob");
  assert.equal(IngestionJobModel.collection.name, "ingestion_jobs");
  assert.equal(AiUsageModel.modelName, "AiUsage");
  assert.equal(AiUsageModel.collection.name, "ai_usage");
});

test("document schema links to the latest ingestion job", () => {
  const paths = DocumentModel.schema.paths;

  assert.equal(paths.lastIngestionJob.options.ref, "IngestionJob");
  assert.equal(paths.lastIngestionJob.defaultValue, null);
  assert.ok(
    DocumentModel.schema
      .indexes()
      .some(([fields]) => fields.status === 1 && fields.updatedAt === -1),
  );
});

test("conversation and message schemas are normalized with owner indexes", () => {
  assert.equal(ConversationModel.schema.path("user").options.ref, "User");
  assert.equal(
    ConversationModel.schema.path("document").options.ref,
    "Document",
  );
  assert.equal(
    MessageModel.schema.path("conversation").options.ref,
    "Conversation",
  );
  assert.equal(MessageModel.schema.path("user").options.ref, "User");
  assert.deepEqual(MessageModel.schema.path("role").enumValues, [
    "user",
    "assistant",
    "system",
    "tool",
  ]);

  assert.ok(
    ConversationModel.schema
      .indexes()
      .some(([fields]) => fields.user === 1 && fields.updatedAt === -1),
  );
  assert.ok(
    MessageModel.schema
      .indexes()
      .some(([fields]) => fields.conversation === 1 && fields.createdAt === 1),
  );
});

test("ingestion job schema stores Mongo-backed state machine fields", () => {
  const paths = IngestionJobModel.schema.paths;

  assert.equal(paths.document.options.ref, "Document");
  assert.equal(paths.user.options.ref, "User");
  assert.deepEqual(paths.state.enumValues, [
    "queued",
    "processing",
    "completed",
    "failed",
  ]);
  assert.equal(paths.state.defaultValue, "queued");
  assert.equal(paths.attempts.defaultValue, 0);
  assert.equal(paths.maxAttempts.defaultValue, 3);
  assert.ok(
    IngestionJobModel.schema
      .indexes()
      .some(([fields]) => fields.state === 1 && fields.createdAt === 1),
  );
});

test("ai usage schema tracks provider, model, operation, and token totals", () => {
  const paths = AiUsageModel.schema.paths;

  assert.equal(paths.user.options.ref, "User");
  assert.equal(paths.document.options.ref, "Document");
  assert.equal(paths.ingestionJob.options.ref, "IngestionJob");
  assert.equal(paths.conversation.options.ref, "Conversation");
  assert.deepEqual(paths.operation.enumValues, [
    "ingestion",
    "embedding",
    "chat",
    "completion",
  ]);
  assert.equal(paths.totalTokens.defaultValue, 0);
  assert.ok(
    AiUsageModel.schema
      .indexes()
      .some(([fields]) => fields.user === 1 && fields.createdAt === -1),
  );
});
