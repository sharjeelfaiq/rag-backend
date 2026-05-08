import assert from "node:assert/strict";
import test from "node:test";

test("notificationService.getMyNotifications uses the authenticated user id", async () => {
  const { notificationService } =
    await import("../../src/api/notification/notification.service.js");
  const { notificationRepository } =
    await import("../../src/api/notification/notification.repository.js");
  const originalGetByUserId = notificationRepository.getByUserId;

  notificationRepository.getByUserId = async (userId) => {
    assert.equal(userId, "user-1");
    return [];
  };

  try {
    const result = await notificationService.getMyNotifications("user-1");

    assert.equal(result.status, "success");
    assert.deepEqual(result.data, []);
  } finally {
    notificationRepository.getByUserId = originalGetByUserId;
  }
});

test("notificationService.updateNotificationById only updates owned notifications", async () => {
  const { notificationService } =
    await import("../../src/api/notification/notification.service.js");
  const { notificationRepository } =
    await import("../../src/api/notification/notification.repository.js");
  const originalUpdateReadStatusForUser =
    notificationRepository.updateReadStatusForUser;

  notificationRepository.updateReadStatusForUser = async (update) => {
    assert.deepEqual(update, {
      notificationId: "noti-1",
      userId: "user-1",
      read: true,
    });
    return { _id: "noti-1", user: "user-1", read: true };
  };

  try {
    const result = await notificationService.updateNotificationById(
      "noti-1",
      "user-1",
    );

    assert.equal(result.status, "success");
    assert.deepEqual(result.data, {
      _id: "noti-1",
      user: "user-1",
      read: true,
    });
  } finally {
    notificationRepository.updateReadStatusForUser =
      originalUpdateReadStatusForUser;
  }
});
