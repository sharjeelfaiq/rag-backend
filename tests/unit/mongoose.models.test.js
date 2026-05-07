import assert from "node:assert/strict";
import test from "node:test";

import { NotificationModel } from "../../src/api/notification/notification.model.js";
import { OtpModel } from "../../src/api/otp/otp.model.js";
import { UserModel } from "../../src/api/user/user.model.js";

test("user model uses PascalCase name with explicit users collection", () => {
  assert.equal(UserModel.modelName, "User");
  assert.equal(UserModel.collection.name, "users");
});

test("otp model uses PascalCase name with explicit otps collection", () => {
  assert.equal(OtpModel.modelName, "Otp");
  assert.equal(OtpModel.collection.name, "otps");
});

test("notification model uses PascalCase name with explicit notifications collection", () => {
  assert.equal(NotificationModel.modelName, "Notification");
  assert.equal(NotificationModel.collection.name, "notifications");
});

test("schema refs match registered PascalCase model names", () => {
  assert.equal(OtpModel.schema.path("userId").options.ref, "User");
  assert.equal(NotificationModel.schema.path("user").options.ref, "User");
});
