import assert from "node:assert/strict";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("userController.deleteMe deletes the authenticated user and sends 204", async () => {
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
    await userController.deleteMe({ user: { id: "user-1" } }, response);
  } finally {
    userService.deleteById = originalDeleteById;
  }

  assert.equal(response.statusCode, 204);
  assert.equal(response.body, undefined);
});

test("userController.updateMe updates only the authenticated user", async () => {
  const { userController } =
    await import("../../src/api/user/user.controller.js");
  const { userService } = await import("../../src/api/user/user.service.js");
  const originalUpdateById = userService.updateById;
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  userService.updateById = async (id, body, files) => {
    assert.equal(id, "user-1");
    assert.deepEqual(body, { firstName: "Updated" });
    assert.deepEqual(files, { avatar: [] });
    return { message: "User updated successfully" };
  };

  try {
    await userController.updateMe(
      {
        user: { id: "user-1" },
        params: { id: "other-user" },
        body: { firstName: "Updated" },
        files: { avatar: [] },
      },
      response,
    );
  } finally {
    userService.updateById = originalUpdateById;
  }

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { message: "User updated successfully" });
});
