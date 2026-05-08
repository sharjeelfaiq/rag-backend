import assert from "node:assert/strict";
import test from "node:test";

const collectRoutes = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));

test("ingestion routes expose job submission, status, and retry endpoints", async () => {
  const { ingestionRoutes } =
    await import("../../src/api/ingestion/ingestion.routes.js");

  assert.deepEqual(collectRoutes(ingestionRoutes), [
    { path: "/jobs", methods: ["post"] },
    { path: "/jobs", methods: ["get"] },
    { path: "/jobs/:id", methods: ["get"] },
    { path: "/jobs/:id/retry", methods: ["post"] },
  ]);
});

test("conversation, message, and ai usage routes expose owned API surfaces", async () => {
  const { conversationRoutes } =
    await import("../../src/api/conversation/conversation.routes.js");
  const { aiUsageRoutes } =
    await import("../../src/api/ai-usage/ai-usage.routes.js");

  assert.deepEqual(collectRoutes(conversationRoutes), [
    { path: "/", methods: ["post"] },
    { path: "/", methods: ["get"] },
    { path: "/:id/messages", methods: ["post"] },
    { path: "/:id/messages", methods: ["get"] },
  ]);
  assert.deepEqual(collectRoutes(aiUsageRoutes), [
    { path: "/", methods: ["get"] },
  ]);
});
