import assert from "node:assert/strict";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("verifyAccessToken attaches only the authenticated user id", async () => {
  const { verifyAccessToken } =
    await import("../../src/middlewares/auth.middleware.js");
  const { generateToken } = await import("../../src/lib/token.lib.js");
  const token = generateToken("user-1");
  const req = {
    cookies: {
      access_token: token,
    },
  };
  let nextCalled = false;

  verifyAccessToken(req, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { id: "user-1" });
});

test("auth middleware does not export role-based authorization", async () => {
  const authMiddleware =
    await import("../../src/middlewares/auth.middleware.js");

  assert.equal("verifyAuthRole" in authMiddleware, false);
});
