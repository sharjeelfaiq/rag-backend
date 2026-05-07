import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import test from "node:test";

import { applyTestEnv } from "../helpers/env.js";

applyTestEnv();

test("authService.signin authenticates an existing user by username", async () => {
  const { authService } = await import("../../src/api/auth/auth.service.js");
  const { userRepository } =
    await import("../../src/api/user/user.repository.js");
  const originalFindUserByEmailOrUsername =
    userRepository.findUserByEmailOrUsername;
  const password = "secure-password";
  const hashedPassword = await bcrypt.hash(password, 4);

  userRepository.findUserByEmailOrUsername = async (credentials) => {
    assert.deepEqual(credentials, { email: undefined, username: "testuser" });
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
      username: "testuser",
      password,
      isRemembered: false,
    });

    assert.equal(result.message, "Sign-in successful");
    assert.equal(typeof result.token, "string");
    assert.deepEqual(result.data, {
      id: "user-1",
      name: "Test User",
    });
  } finally {
    userRepository.findUserByEmailOrUsername =
      originalFindUserByEmailOrUsername;
  }
});

test("authService.signin preserves existing email authentication", async () => {
  const { authService } = await import("../../src/api/auth/auth.service.js");
  const { userRepository } =
    await import("../../src/api/user/user.repository.js");
  const originalFindUserByEmailOrUsername =
    userRepository.findUserByEmailOrUsername;
  const password = "secure-password";
  const hashedPassword = await bcrypt.hash(password, 4);

  userRepository.findUserByEmailOrUsername = async (credentials) => {
    assert.deepEqual(credentials, {
      email: "user@example.com",
      username: undefined,
    });
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
    userRepository.findUserByEmailOrUsername =
      originalFindUserByEmailOrUsername;
  }
});

test("authService.signin rejects missing username credentials", async () => {
  const { authService } = await import("../../src/api/auth/auth.service.js");
  const { userRepository } =
    await import("../../src/api/user/user.repository.js");
  const originalFindUserByEmailOrUsername =
    userRepository.findUserByEmailOrUsername;

  userRepository.findUserByEmailOrUsername = async (credentials) => {
    assert.deepEqual(credentials, { email: undefined, username: "missing" });
    return null;
  };

  try {
    await assert.rejects(
      () =>
        authService.signin({
          username: "missing",
          password: "secure-password",
        }),
      (error) =>
        error.status === 401 &&
        error.message === "Invalid email or password.",
    );
  } finally {
    userRepository.findUserByEmailOrUsername =
      originalFindUserByEmailOrUsername;
  }
});
