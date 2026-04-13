"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendMessage, markThreadAsRead } from "@/services/message.service";
import { sendMessageSchema, markThreadReadSchema } from "@/validators/action.schemas";
import { createNotification } from "@/services/notification.service";
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

    const limit = rateLimit(`send-message:${session.user.id}`, SEND_MESSAGE_RATE_LIMIT);
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

    // Verify receiver exists
    const receiver = await db.user.findUnique({
      where: { id: parsed.data.receiverId },
      select: { id: true, name: true },
    });
    if (!receiver) return { success: false, error: "Recipient not found" };

    await sendMessage(
      session.user.id,
      parsed.data.receiverId,
      parsed.data.body,
      parsed.data.subject
    );

    // Send a notification to the receiver
    const senderName = session.user.name ?? "Someone";
    await createNotification(parsed.data.receiverId, {
      title: `New message from ${senderName}`,
      message: parsed.data.body.length > 80
        ? parsed.data.body.slice(0, 80) + "…"
        : parsed.data.body,
      type: "MESSAGE",
      link: `/messages/${session.user.id}`,
    });

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
