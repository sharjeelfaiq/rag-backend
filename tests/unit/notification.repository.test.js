import assert from "node:assert/strict";
import test from "node:test";

import { NotificationModel } from "../../src/api/notification/notification.model.js";
import { notificationRepository } from "../../src/api/notification/notification.repository.js";

test("updateReadStatusForUser scopes notification updates to the owner", async () => {
  const originalFindOneAndUpdate = NotificationModel.findOneAndUpdate;
  let capturedArguments;

  NotificationModel.findOneAndUpdate = (...args) => {
    capturedArguments = args;
    return {
      exec: async () => null,
    };
  };

  try {
    const result = await notificationRepository.updateReadStatusForUser({
      notificationId: "noti-1",
      userId: "user-1",
      read: true,
    });

    assert.equal(result, null);
    assert.deepEqual(capturedArguments, [
      { _id: "noti-1", user: "user-1" },
      { $set: { read: true } },
      { new: true, runValidators: true },
    ]);
  } finally {
    NotificationModel.findOneAndUpdate = originalFindOneAndUpdate;
  }
});
