import assert from "node:assert/strict";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("handlePromise forwards express errors once without rethrowing", async () => {
  const { handlePromise } = await import("../../src/lib/promise.lib.js");
  const expectedError = new Error("boom");
  let forwardedError;
  let forwardCount = 0;

  const wrapped = handlePromise(async () => {
    throw expectedError;
  });

  const result = await wrapped({}, {}, (error) => {
    forwardedError = error;
    forwardCount += 1;
  });

  assert.equal(result, undefined);
  assert.equal(forwardCount, 1);
  assert.equal(forwardedError, expectedError);
});
