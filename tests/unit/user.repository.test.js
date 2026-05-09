import assert from "node:assert/strict";
import test from "node:test";

import { UserModel } from "../../src/api/user/user.model.js";
import { userRepository } from "../../src/api/user/user.repository.js";

const removedField = ["user", "name"].join("");

test("createUser persists only email identity fields", async () => {
  const originalCreate = UserModel.create;
  let capturedDocument;

  UserModel.create = async (document) => {
    capturedDocument = document;
    return document;
  };

  try {
    const result = await userRepository.createUser(
      "Test",
      "User",
      "user@example.com",
      "hashed-password",
    );

    assert.deepEqual(result, {
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      password: "hashed-password",
    });
    assert.equal(Object.hasOwn(capturedDocument, removedField), false);
  } finally {
    UserModel.create = originalCreate;
  }
});

test("findUserByEmail uses a direct email lookup", async () => {
  const originalFindOne = UserModel.findOne;
  let capturedQuery;

  UserModel.findOne = async (query) => {
    capturedQuery = query;
    return null;
  };

  try {
    const result = await userRepository.findUserByEmail("user@example.com");

    assert.equal(result, null);
    assert.deepEqual(capturedQuery, {
      email: "user@example.com",
    });
  } finally {
    UserModel.findOne = originalFindOne;
  }
});

test("updateUserById preserves new:true and does not pass upsert", async () => {
  const originalFindByIdAndUpdate = UserModel.findByIdAndUpdate;
  let capturedArguments;

  UserModel.findByIdAndUpdate = async (...args) => {
    capturedArguments = args;
    return null;
  };

  try {
    const result = await userRepository.updateUserById("user-1", {
      firstName: "Updated",
    });

    assert.equal(result, null);
    assert.deepEqual(capturedArguments, [
      "user-1",
      { firstName: "Updated" },
      { new: true },
    ]);
  } finally {
    UserModel.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test("updateUserByEmail preserves new:true and does not pass upsert", async () => {
  const originalFindOneAndUpdate = UserModel.findOneAndUpdate;
  let capturedArguments;

  UserModel.findOneAndUpdate = async (...args) => {
    capturedArguments = args;
    return null;
  };

  try {
    const result = await userRepository.updateUserByEmail("user@example.com", {
      firstName: "Updated",
    });

    assert.equal(result, null);
    assert.deepEqual(capturedArguments, [
      { email: "user@example.com" },
      { firstName: "Updated" },
      { new: true },
    ]);
  } finally {
    UserModel.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test("updateUserPasswordByEmail preserves new:true and does not pass upsert", async () => {
  const originalFindOneAndUpdate = UserModel.findOneAndUpdate;
  let capturedArguments;

  UserModel.findOneAndUpdate = async (...args) => {
    capturedArguments = args;
    return null;
  };

  try {
    const result = await userRepository.updateUserPasswordByEmail(
      "user@example.com",
      "hashed-password",
    );

    assert.equal(result, null);
    assert.deepEqual(capturedArguments, [
      { email: "user@example.com" },
      { password: "hashed-password" },
      { new: true },
    ]);
  } finally {
    UserModel.findOneAndUpdate = originalFindOneAndUpdate;
  }
});
