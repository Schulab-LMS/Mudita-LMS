"use server";

import { auth } from "@/lib/auth";
import { markAsRead, markAllAsRead } from "@/services/notification.service";
import { markNotificationReadSchema } from "@/validators/action.schemas";

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = markNotificationReadSchema.safeParse({ id });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const updated = await markAsRead(parsed.data.id, session.user.id);
  if (updated === 0) return { error: "Notification not found" };
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  await markAllAsRead(session.user.id);
  return { success: true };
}
