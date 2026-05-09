import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("authService.signin preserves existing email authentication", async () => {
  const { authService } = await import("../../src/api/auth/auth.service.js");
  const { userRepository } =
    await import("../../src/api/user/user.repository.js");
  const originalFindUserByEmail = userRepository.findUserByEmail;
  const password = "secure-password";
  const hashedPassword = await bcrypt.hash(password, 4);

  userRepository.findUserByEmail = async (email) => {
    assert.equal(email, "user@example.com");
    return {
      _id: "user-1",
      firstName: "Test",
      lastName: "User",
      password: hashedPassword,
      isEmailVerified: true,
    };
  };

  try {
    const result = await authService.signin({
      email: "user@example.com",
      password,
      isRemembered: true,
    });

    assert.equal(result.message, "Sign-in successful");
    assert.equal(typeof result.token, "string");
    assert.deepEqual(result.data, {
      id: "user-1",
      name: "Test User",
    });
  } finally {
    userRepository.findUserByEmail = originalFindUserByEmail;
  }
});

test("authService.signin rejects missing email credentials", async () => {
  const { authService } = await import("../../src/api/auth/auth.service.js");
  const { userRepository } =
    await import("../../src/api/user/user.repository.js");
  const originalFindUserByEmail = userRepository.findUserByEmail;

  userRepository.findUserByEmail = async (email) => {
    assert.equal(email, "missing@example.com");
    return null;
  };

  try {
    await assert.rejects(
      () =>
        authService.signin({
          email: "missing@example.com",
          password: "secure-password",
        }),
      (error) =>
        error.status === 401 && error.message === "Invalid email or password.",
    );
  } finally {
    userRepository.findUserByEmail = originalFindUserByEmail;
  }
});
