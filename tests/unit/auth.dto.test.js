import assert from "node:assert/strict";
import test from "node:test";

import { signinDto } from "../../src/api/auth/auth.dto.js";

test("signinDto accepts username with password", () => {
  const { error, value } = signinDto.validate({
    username: "TestUser",
    password: "secure-password",
  });

  assert.equal(error, undefined);
  assert.equal(value.username, "testuser");
  assert.equal(value.password, "secure-password");
});

test("signinDto rejects email and username together", () => {
  const { error } = signinDto.validate({
    email: "user@example.com",
    username: "testuser",
    password: "secure-password",
  });

  assert.match(error.message, /Either email or username/);
});

test("signinDto rejects missing email and username", () => {
  const { error } = signinDto.validate({
    password: "secure-password",
  });

  assert.match(error.message, /Either email or username/);
});
