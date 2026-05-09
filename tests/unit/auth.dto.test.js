import assert from "node:assert/strict";
import test from "node:test";

import { signinDto } from "../../src/api/auth/auth.dto.js";

const removedField = ["user", "name"].join("");

test("signinDto accepts email with password", () => {
  const { error, value } = signinDto.validate({
    email: "User@Example.com",
    password: "secure-password",
  });

  assert.equal(error, undefined);
  assert.equal(value.email, "user@example.com");
  assert.equal(value.password, "secure-password");
});

test("signinDto rejects removed identifier fields", () => {
  const { error } = signinDto.validate({
    email: "user@example.com",
    [removedField]: "testuser",
    password: "secure-password",
  });

  assert.match(error.message, /is not allowed/);
});

test("signinDto requires email", () => {
  const { error } = signinDto.validate({
    password: "secure-password",
  });

  assert.match(error.message, /Email is required/);
});
