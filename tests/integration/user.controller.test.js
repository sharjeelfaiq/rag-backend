import assert from "node:assert/strict";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("userController.deleteById sends an empty 204 response", async () => {
  const { userController } =
    await import("../../src/api/user/user.controller.js");
  const { userService } = await import("../../src/api/user/user.service.js");
  const originalDeleteById = userService.deleteById;
  const response = {
    statusCode: null,
    body: "unset",
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };

  userService.deleteById = async (id) => {
    assert.equal(id, "user-1");
    return { message: "User deleted successfully" };
  };

  try {
    await userController.deleteById({ params: { id: "user-1" } }, response);
  } finally {
    userService.deleteById = originalDeleteById;
  }

  assert.equal(response.statusCode, 204);
  assert.equal(response.body, undefined);
});
