import { db } from "@/lib/db";

// Live polls inside a classroom session. Each poll is "open" between
// openedAt and closedAt; only the tutor can open/close. Students vote (one
// vote per poll per student, idempotent — re-voting updates the existing
// row rather than inserting a duplicate). Results are derived from
// ClassroomPollVote so the row count is always authoritative.

export interface PollResultsBucket {
  index: number;
  label: string;
  count: number;
}

export interface PollView {
  id: string;
  question: string;
  options: string[];
  openedAt: Date;
  closedAt: Date | null;
  // (optionIndex → count). Derived from ClassroomPollVote.
  results: PollResultsBucket[];
  totalVotes: number;
  // The viewer's own pick, if any. null when the viewer hasn't voted yet.
  myVote: number | null;
}

export async function openPoll(input: {
  sessionId: string;
  openedBy: string;
  question: string;
  options: string[];
}): Promise<PollView> {
  const question = input.question.trim();
  if (!question) throw new Error("Poll question is required");
  const options = input.options
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
  if (options.length < 2) throw new Error("Poll needs at least 2 options");
  if (options.length > 8) throw new Error("Poll capped at 8 options");

  const poll = await db.classroomPoll.create({
    data: {
      sessionId: input.sessionId,
      openedBy: input.openedBy,
      question,
      options,
    },
  });
  return toView(poll, [], null);
}

export async function closePoll(pollId: string): Promise<void> {
  await db.classroomPoll.update({
    where: { id: pollId },
    data: { closedAt: new Date() },
  });
}

export async function recordVote(input: {
  pollId: string;
  userId: string;
  optionIndex: number;
}): Promise<void> {
  const poll = await db.classroomPoll.findUnique({
    where: { id: input.pollId },
    select: { closedAt: true, options: true },
  });
  if (!poll) throw new Error("Poll not found");
  if (poll.closedAt) throw new Error("Poll has been closed");
  if (input.optionIndex < 0 || input.optionIndex >= poll.options.length) {
    throw new Error("Invalid option");
  }

  // Idempotent: re-voting updates the existing row. The (pollId, userId)
  // unique constraint guarantees we don't double-count.
  await db.classroomPollVote.upsert({
    where: {
      pollId_userId: { pollId: input.pollId, userId: input.userId },
    },
    create: {
      pollId: input.pollId,
      userId: input.userId,
      optionIndex: input.optionIndex,
    },
    update: { optionIndex: input.optionIndex, votedAt: new Date() },
  });
}

/**
 * All polls for a session, oldest first, with current results + the viewer's
 * own vote pre-resolved. Used by the session page to hydrate the polls panel
 * on join.
 */
export async function listPolls(
  sessionId: string,
  viewerUserId: string
): Promise<PollView[]> {
  const polls = await db.classroomPoll.findMany({
    where: { sessionId },
    orderBy: { openedAt: "asc" },
    include: {
      votes: {
        select: { userId: true, optionIndex: true },
      },
    },
  });
  return polls.map((p) => {
    const myVote =
      p.votes.find((v) => v.userId === viewerUserId)?.optionIndex ?? null;
    return toView(p, p.votes, myVote);
  });
}

function toView(
  poll: {
    id: string;
    question: string;
    options: string[];
    openedAt: Date;
    closedAt: Date | null;
  },
  votes: { optionIndex: number }[],
  myVote: number | null
): PollView {
  const counts = poll.options.map((label, index) => ({
    index,
    label,
    count: votes.filter((v) => v.optionIndex === index).length,
  }));
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options,
    openedAt: poll.openedAt,
    closedAt: poll.closedAt,
    results: counts,
    totalVotes: votes.length,
    myVote,
  };
}
