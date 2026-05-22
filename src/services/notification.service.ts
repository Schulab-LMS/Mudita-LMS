import { db } from "@/lib/db";

export async function createNotification(
  userId: string,
  data: { title: string; message: string; type?: string; link?: string }
) {
  try {
    return await db.notification.create({
      data: {
        userId,
        title: data.title,
        body: data.message,
        type: data.type ?? "INFO",
        link: data.link,
      },
    });
  } catch {
    return null;
  }
}

export async function getNotifications(userId: string, limit = 50) {
  try {
    return await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

/**
 * Mark a notification as read. Scoped to `userId` so users cannot
 * read or modify another user's notifications by guessing the id.
 * Returns the number of rows updated (0 when the id does not belong
 * to this user).
 */
export async function markAsRead(notificationId: string, userId: string) {
  try {
    const result = await db.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    return result.count;
  } catch {
    return 0;
  }
}

export async function markAllAsRead(userId: string) {
  try {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getUnreadCount(userId: string) {
  try {
    return await db.notification.count({
      where: { userId, isRead: false },
    });
  } catch {
    return 0;
  }
}

/**
 * Mark the in-app MESSAGE notifications a user received from a specific
 * sender as read. Called when the user opens that conversation thread so
 * the bell badge clears in step with the messages themselves. The link
 * column encodes the sender (`/messages/{senderId}`), set when the
 * notification is created in `sendMessageAction`.
 */
export async function markMessageNotificationsRead(userId: string, senderId: string) {
  try {
    const result = await db.notification.updateMany({
      where: {
        userId,
        type: "MESSAGE",
        link: `/messages/${senderId}`,
        isRead: false,
      },
      data: { isRead: true },
    });
    return result.count;
  } catch {
    return 0;
  }
}
