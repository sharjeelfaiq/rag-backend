import assert from "node:assert/strict";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("emailService.send looks users up by email and returns 404 when missing", async () => {
  const { emailService } = await import("../../src/api/email/email.service.js");
  const { userRepository } =
    await import("../../src/api/user/user.repository.js");
  const originalFindUserByEmail = userRepository.findUserByEmail;

  userRepository.findUserByEmail = async (email) => {
    assert.equal(email, "missing@example.com");
    return null;
  };

  try {
    await assert.rejects(
      () => emailService.send({ email: "missing@example.com" }),
      (error) => error.status === 404 && error.message === "User not found",
    );
  } finally {
    userRepository.findUserByEmail = originalFindUserByEmail;
  }
});
