import assert from "node:assert/strict";
import test from "node:test";

const collectRoutes = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).sort(),
    }));

test("document routes expose owned document endpoints without user id params", async () => {
  const { documentRoutes } =
    await import("../../src/api/document/document.routes.js");

  assert.deepEqual(collectRoutes(documentRoutes), [
    { path: "/upload", methods: ["post"] },
    { path: "/", methods: ["get"] },
    { path: "/:id", methods: ["get"] },
    { path: "/:id", methods: ["delete"] },
  ]);
});
