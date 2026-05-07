import assert from "node:assert/strict";
import test from "node:test";

import { serializeError } from "../../src/middlewares/global.middleware.js";

test("serializeError omits stack traces in production responses", () => {
  const error = new Error("database credentials leaked in stack");
  error.statusCode = 500;

  const responseBody = serializeError(error, "production");

  assert.deepEqual(responseBody, {
    status: 500,
    message: "database credentials leaked in stack",
  });
});

test("serializeError includes stack traces in development responses", () => {
  const error = new Error("debuggable failure");
  error.statusCode = 400;
  error.stack = "Error: debuggable failure\n    at internalModule";

  const responseBody = serializeError(error, "development");

  assert.deepEqual(responseBody, {
    status: 400,
    message: "debuggable failure",
    stack: "Error: debuggable failure\n    at internalModule",
  });
});
