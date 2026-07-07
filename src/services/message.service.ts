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
// canMessageRole is the ROLE gate (pure, no DB). The full safeguarding gate is
// canMessage() below, which additionally requires a booking RELATIONSHIP for
// tutor↔student / tutor↔parent pairs — so a tutor can't cold-contact an
// arbitrary minor. Write paths use canMessage(); canMessageRole is the cheap
// pre-filter it builds on.
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

const isAdminRole = (r: string) => r === "ADMIN" || r === "SUPER_ADMIN";

/**
 * Relationship-aware messaging gate — the control enforced on write paths.
 * Combines the role policy with a booking-relationship check so a vetted adult
 * can't cold-contact an arbitrary minor: TUTOR↔STUDENT and TUTOR↔PARENT pairs
 * must share a Booking. ADMIN/SUPER_ADMIN on either side bypass the relationship
 * check (support & moderation) — which also covers every role-allowed pair that
 * isn't relationship-based (parent→admin, b2b→admin, admin→anyone).
 */
export async function canMessage(
  sender: { id: string; role: string },
  recipient: { id: string; role: string }
): Promise<boolean> {
  if (!canMessageRole(sender.role, recipient.role)) return false;
  if (isAdminRole(sender.role) || isAdminRole(recipient.role)) return true;

  // The only remaining role-allowed pairs are tutor↔student and tutor↔parent.
  const tutor = sender.role === "TUTOR" ? sender : recipient;
  const learner = sender.role === "TUTOR" ? recipient : sender;
  return sharesBookingWithTutor(tutor.id, learner);
}

/**
 * True when `tutorUserId` shares at least one Booking with the learner — either
 * directly (learner is a STUDENT) or via a linked child (learner is a PARENT).
 * Any booking counts (past / pending / cancelled): it proves the two are not
 * strangers, which is the safeguarding property we need. Booking.tutorId is a
 * TutorProfile id, so we match through the tutor's userId.
 */
async function sharesBookingWithTutor(
  tutorUserId: string,
  learner: { id: string; role: string }
): Promise<boolean> {
  let studentIds: string[];
  if (learner.role === "STUDENT") {
    studentIds = [learner.id];
  } else if (learner.role === "PARENT") {
    const links = await db.parentChild.findMany({
      where: { parentId: learner.id },
      select: { childId: true },
    });
    studentIds = links.map((l) => l.childId);
  } else {
    return false;
  }
  if (studentIds.length === 0) return false;

  const count = await db.booking.count({
    where: { studentId: { in: studentIds }, tutor: { userId: tutorUserId } },
  });
  return count > 0;
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

export type MessageableUser = {
  id: string;
  name: string | null;
  avatar: string | null;
  role: string;
};

// Card fields surfaced to the recipient picker.
const USER_CARD = { id: true, name: true, avatar: true, role: true } as const;

// Dedupe raw user rows by id, drop inactive users, return sorted display cards.
function dedupeActive(
  rows: Array<MessageableUser & { isActive: boolean }>
): MessageableUser[] {
  const seen = new Map<string, MessageableUser>();
  for (const u of rows) {
    if (!u.isActive || seen.has(u.id)) continue;
    seen.set(u.id, { id: u.id, name: u.name, avatar: u.avatar, role: u.role });
  }
  return Array.from(seen.values()).sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "")
  );
}

/**
 * Users the current user may START a conversation with — a safe SUBSET of what
 * the canMessage() gate allows, derived from real booking relationships so the
 * picker never offers a contact the send guard would reject:
 *   • ADMIN / SUPER_ADMIN → everyone (support & moderation)
 *   • STUDENT             → tutors they've booked
 *   • TUTOR               → their booked students + those students' parents
 *   • PARENT              → their children's tutors
 *   • others              → none (no browse-and-pick flow)
 */
export async function getMessageableUsers(
  currentUserId: string,
  currentRole: string
): Promise<MessageableUser[]> {
  try {
    if (isAdminRole(currentRole)) {
      return db.user.findMany({
        where: { isActive: true, id: { not: currentUserId } },
        select: USER_CARD,
        orderBy: { name: "asc" },
        take: 100,
      });
    }

    if (currentRole === "STUDENT") {
      const bookings = await db.booking.findMany({
        where: { studentId: currentUserId },
        select: { tutor: { select: { user: { select: { ...USER_CARD, isActive: true } } } } },
      });
      return dedupeActive(bookings.map((b) => b.tutor.user));
    }

    if (currentRole === "TUTOR") {
      const profile = await db.tutorProfile.findUnique({
        where: { userId: currentUserId },
        select: { id: true },
      });
      if (!profile) return [];
      const bookings = await db.booking.findMany({
        where: { tutorId: profile.id },
        select: { student: { select: { ...USER_CARD, isActive: true } } },
      });
      const students = bookings.map((b) => b.student);
      const studentIds = Array.from(new Set(students.map((s) => s.id)));
      const parentLinks = studentIds.length
        ? await db.parentChild.findMany({
            where: { childId: { in: studentIds } },
            select: { parent: { select: { ...USER_CARD, isActive: true } } },
          })
        : [];
      return dedupeActive([...students, ...parentLinks.map((l) => l.parent)]);
    }

    if (currentRole === "PARENT") {
      const links = await db.parentChild.findMany({
        where: { parentId: currentUserId },
        select: { childId: true },
      });
      const childIds = links.map((l) => l.childId);
      if (childIds.length === 0) return [];
      const bookings = await db.booking.findMany({
        where: { studentId: { in: childIds } },
        select: { tutor: { select: { user: { select: { ...USER_CARD, isActive: true } } } } },
      });
      return dedupeActive(bookings.map((b) => b.tutor.user));
    }

    return [];
  } catch {
    return [];
  }
}
