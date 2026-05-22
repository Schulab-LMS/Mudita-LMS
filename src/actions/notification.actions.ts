"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "@/services/notification.service";
import { markNotificationReadSchema } from "@/validators/action.schemas";

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = markNotificationReadSchema.safeParse({ id });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const updated = await markAsRead(parsed.data.id, session.user.id);
  if (updated === 0) return { error: "Notification not found" };
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  await markAllAsRead(session.user.id);
  revalidatePath("/notifications");
  return { success: true };
}

/**
 * Lightweight unread-notification count for the topbar bell. Polled from
 * the client so the badge updates while the user stays on a page — server
 * `revalidatePath` from the sender's request never reaches the receiver's
 * already-rendered layout, so without polling the badge would only refresh
 * on a full navigation.
 */
export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;
  return getUnreadCount(session.user.id);
}
