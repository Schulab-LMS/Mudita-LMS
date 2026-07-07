"use server";

import { auth } from "@/lib/auth";
import { assertEmailVerified } from "@/lib/auth-helpers";
import { isInPreviewMode, PREVIEW_WRITE_BLOCKED_MESSAGE } from "@/lib/view-as.server";
import { revalidatePath } from "next/cache";
import { sendMessage, markThreadAsRead, canMessageRole } from "@/services/message.service";
import { sendMessageSchema, markThreadReadSchema } from "@/validators/action.schemas";
import { createNotification } from "@/services/notification.service";
import { sendNewMessageEmail } from "@/lib/email";
import { db } from "@/lib/db";
import { rateLimit, SEND_MESSAGE_RATE_LIMIT } from "@/lib/rate-limit";

export async function sendMessageAction(data: {
  receiverId: string;
  body: string;
  subject?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    if (await isInPreviewMode()) {
      return { success: false, error: PREVIEW_WRITE_BLOCKED_MESSAGE };
    }

    const emailCheck = await assertEmailVerified(session.user.id);
    if (!emailCheck.ok) return { success: false, error: emailCheck.error };

    const limit = await rateLimit(`send-message:${session.user.id}`, SEND_MESSAGE_RATE_LIMIT);
    if (!limit.success) {
      return {
        success: false,
        error: `Too many messages. Try again in ${limit.retryAfterSeconds}s.`,
      };
    }

    const parsed = sendMessageSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // Prevent messaging yourself
    if (parsed.data.receiverId === session.user.id) {
      return { success: false, error: "Cannot send a message to yourself" };
    }

    // Verify the receiver exists AND the sender is permitted to contact them.
    // Safeguarding gate: without the canMessageRole check, any authenticated
    // account can DM any user by id (incl. adult→minor). The relationship policy
    // lives in MESSAGEABLE_ROLES (message.service.ts).
    const receiver = await db.user.findUnique({
      where: { id: parsed.data.receiverId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!receiver) return { success: false, error: "Recipient not found" };

    const senderRole = session.user.role;
    if (!senderRole || !canMessageRole(senderRole, receiver.role)) {
      return { success: false, error: "You aren't allowed to message this user." };
    }

    // Throttle email notifications: only mail the recipient when this is the
    // first message they haven't yet read from this sender. During an active
    // back-and-forth they already have the thread open, so one email per
    // reply would be noise. Counted before the insert below.
    const priorUnread = await db.message.count({
      where: {
        senderId: session.user.id,
        receiverId: parsed.data.receiverId,
        isRead: false,
      },
    });

    await sendMessage(
      session.user.id,
      parsed.data.receiverId,
      parsed.data.body,
      parsed.data.subject
    );

    // Send a notification to the receiver
    const senderName = session.user.name ?? "Someone";
    const preview =
      parsed.data.body.length > 80
        ? parsed.data.body.slice(0, 80) + "…"
        : parsed.data.body;
    await createNotification(parsed.data.receiverId, {
      title: `New message from ${senderName}`,
      message: preview,
      type: "MESSAGE",
      link: `/messages/${session.user.id}`,
    });

    // Email the recipient (non-blocking) on the first unread message only.
    if (priorUnread === 0 && receiver.email) {
      sendNewMessageEmail(
        receiver.email,
        receiver.name,
        senderName,
        preview,
        session.user.id
      ).catch(() => null);
    }

    revalidatePath(`/messages/${parsed.data.receiverId}`);
    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    console.error("sendMessageAction error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function markThreadReadAction(otherUserId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    const parsed = markThreadReadSchema.safeParse({ otherUserId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await markThreadAsRead(session.user.id, parsed.data.otherUserId);
    revalidatePath(`/messages/${parsed.data.otherUserId}`);
    revalidatePath("/messages");
    return { success: true };
  } catch (error) {
    console.error("markThreadReadAction error:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}
