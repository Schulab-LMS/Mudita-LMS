import { db } from "@/lib/db";

// ── Messaging policy (safeguarding) ───────────────────────────────────────
// Who may INITIATE a message to whom, keyed by the sender's role. On a platform
// used by minors this is a safeguarding control: only vetted adult roles
// (TUTOR, ADMIN, SUPER_ADMIN) may reach a STUDENT at all, and a student may only
// reach a TUTOR — so no learner can be cold-messaged by an arbitrary account.
//
// This is the single source of truth for BOTH the send guard
// (sendMessageAction) and the recipient picker (getMessageableUsers), so the UI
// can never offer — and the server can never accept — a message the policy
// forbids. Edit this map to change who-can-message-whom.
//
// NOTE: this is ROLE-scoped, not relationship-scoped — a TUTOR may currently
// message ANY student, not only their booked students. Tightening to
// relationship scope (tutor ↔ their booked students; parent ↔ their children's
// tutors) is a tracked follow-up.
const ALL_ROLES = [
  "STUDENT",
  "PARENT",
  "TUTOR",
  "ADMIN",
  "SUPER_ADMIN",
  "B2B_PARTNER",
  "ORG_ADMIN",
];
export const MESSAGEABLE_ROLES: Record<string, string[]> = {
  STUDENT: ["TUTOR"],
  PARENT: ["TUTOR", "ADMIN", "SUPER_ADMIN"],
  TUTOR: ["STUDENT", "PARENT"],
  ADMIN: ALL_ROLES,
  SUPER_ADMIN: ALL_ROLES,
  B2B_PARTNER: ["ADMIN", "SUPER_ADMIN"],
  ORG_ADMIN: ["ADMIN", "SUPER_ADMIN"],
};

/** Whether a sender with `senderRole` may initiate a message to `recipientRole`. */
export function canMessageRole(senderRole: string, recipientRole: string): boolean {
  return (MESSAGEABLE_ROLES[senderRole] ?? []).includes(recipientRole);
}

/**
 * Returns one row per conversation partner, with the most recent message
 * and the count of unread messages for the given user.
 */
export async function getInbox(userId: string) {
  try {
    // Get all messages where user is sender or receiver
    const messages = await db.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by conversation partner and keep the latest message per partner
    const conversationMap = new Map<
      string,
      {
        partnerId: string;
        partnerName: string | null;
        partnerAvatar: string | null;
        partnerRole: string;
        lastMessage: string;
        lastMessageAt: Date;
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerName: partner.name,
          partnerAvatar: partner.avatar,
          partnerRole: partner.role,
          lastMessage: msg.body,
          lastMessageAt: msg.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages sent TO this user from this partner
      const existing = conversationMap.get(partnerId)!;
      if (!msg.isRead && msg.receiverId === userId) {
        existing.unreadCount += 1;
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Returns all messages between two users, oldest first (for chat display).
 */
export async function getThread(userId: string, otherUserId: string) {
  try {
    return await db.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [];
  }
}

/**
 * Send a message from senderId to receiverId.
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  body: string,
  subject?: string
) {
  return await db.message.create({
    data: { senderId, receiverId, body, subject: subject || null },
  });
}

/**
 * Mark all messages from otherUserId to userId as read.
 */
export async function markThreadAsRead(userId: string, otherUserId: string) {
  return await db.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, isRead: false },
    data: { isRead: true },
  });
}

/**
 * Get basic user info to seed the new-message recipient selector. Returns only
 * users the current user is actually permitted to message, per MESSAGEABLE_ROLES
 * — the same policy the send guard enforces, so the picker and the server agree.
 */
export async function getMessageableUsers(currentUserId: string, currentRole: string) {
  try {
    const allowedRoles = MESSAGEABLE_ROLES[currentRole] ?? [];
    if (allowedRoles.length === 0) return [];

    return await db.user.findMany({
      where: { role: { in: allowedRoles as never }, isActive: true, id: { not: currentUserId } },
      select: { id: true, name: true, avatar: true, role: true },
      orderBy: { name: "asc" },
      take: 100,
    });
  } catch {
    return [];
  }
}
