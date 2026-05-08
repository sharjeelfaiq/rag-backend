import assert from "node:assert/strict";
import test from "node:test";

const collectRoutes = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));

test("user routes expose only authenticated self routes", async () => {
  const { userRoutes } = await import("../../src/api/user/user.routes.js");

  assert.deepEqual(collectRoutes(userRoutes), [
    { path: "/me", methods: ["get"] },
    { path: "/me", methods: ["patch"] },
    { path: "/me", methods: ["delete"] },
  ]);
});

test("notification routes do not accept a user id path parameter", async () => {
  const { notificationRoutes } =
    await import("../../src/api/notification/notification.routes.js");

  assert.deepEqual(collectRoutes(notificationRoutes), [
    { path: "/me", methods: ["get"] },
    { path: "/:notiId", methods: ["patch"] },
  ]);
});

test("document routes do not accept a user id path parameter", async () => {
  const { documentRoutes } =
    await import("../../src/api/document/document.routes.js");

  assert.deepEqual(collectRoutes(documentRoutes), [
    { path: "/upload", methods: ["post"] },
    { path: "/", methods: ["get"] },
    { path: "/:id", methods: ["get"] },
    { path: "/:id", methods: ["delete"] },
  ]);
});
