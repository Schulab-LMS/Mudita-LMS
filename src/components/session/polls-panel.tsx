"use client";

import { useState, type FormEvent } from "react";
import { BarChart3, Check, Plus, X } from "lucide-react";

import type { PollView } from "@/services/classroom-poll.service";
import {
  closeClassroomPoll,
  openClassroomPoll,
  voteOnClassroomPoll,
} from "@/actions/live-classroom.actions";

// Live polls. Tutors open a question + 2..8 options; students tap an option
// to vote. Authoritative state lives in Postgres (ClassroomPoll +
// ClassroomPollVote); LiveKit's `poll` data-channel topic carries only a
// "something changed" ping so peers re-fetch.
//
// State is owned by the parent (LiveClassroomBody) so the data-channel ping
// handler can trigger a refresh without reaching into this component.

interface PollsPanelProps {
  bookingId: string;
  isTutor: boolean;
  polls: PollView[];
  // Re-fetch the polls list. Called after every local mutation and from the
  // parent on data-channel pings.
  onRefresh: () => Promise<void>;
  // Notifies the parent that a poll event just happened locally — the parent
  // is responsible for fanning out a data-channel ping to peers.
  onLocalChange?: () => void;
}

export function PollsPanel({
  bookingId,
  isTutor,
  polls,
  onRefresh,
  onLocalChange,
}: PollsPanelProps) {
  const [composerOpen, setComposerOpen] = useState(false);

  const afterMutation = async () => {
    await onRefresh();
    onLocalChange?.();
  };

  const onOpened = async () => {
    setComposerOpen(false);
    await afterMutation();
  };

  const onVoted = async (pollId: string, optionIndex: number) => {
    const result = await voteOnClassroomPoll(bookingId, pollId, optionIndex);
    if (!result.success) {
      console.warn("[polls] vote failed:", result.error);
      return;
    }
    await afterMutation();
  };

  const onClosed = async (pollId: string) => {
    const result = await closeClassroomPoll(bookingId, pollId);
    if (!result.success) {
      console.warn("[polls] close failed:", result.error);
      return;
    }
    await afterMutation();
  };

  return (
    <div className="card-premium overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Polls</h2>
        </div>
        {isTutor && !composerOpen && (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" aria-hidden />
            New poll
          </button>
        )}
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto p-3">
        {isTutor && composerOpen && (
          <PollComposer
            bookingId={bookingId}
            onSubmitted={async () => {
              setComposerOpen(false);
              await onOpened();
            }}
            onCancel={() => setComposerOpen(false)}
          />
        )}
        {polls.length === 0 && !composerOpen && (
          <p className="px-1 text-xs text-muted-foreground">
            {isTutor
              ? "Open a poll to gauge the room."
              : "No polls yet — your tutor hasn't opened one."}
          </p>
        )}
        {polls.map((p) => (
          <PollCard
            key={p.id}
            poll={p}
            isTutor={isTutor}
            onVote={(idx) => onVoted(p.id, idx)}
            onClose={() => onClosed(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PollComposer({
  bookingId,
  onSubmitted,
  onCancel,
}: {
  bookingId: string;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await openClassroomPoll(
      bookingId,
      question,
      options.filter((o) => o.trim().length > 0)
    );
    setSubmitting(false);
    if (!result.success) {
      setError(result.error ?? "Failed to open poll");
      return;
    }
    setQuestion("");
    setOptions(["", ""]);
    onSubmitted();
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
    >
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        maxLength={300}
        className="block w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-1">
            <input
              type="text"
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              placeholder={`Option ${i + 1}`}
              maxLength={120}
              className="block w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => setOptions(options.filter((_, j) => j !== i))}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                aria-label="Remove option"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        ))}
        {options.length < 8 && (
          <button
            type="button"
            onClick={() => setOptions([...options, ""])}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-primary hover:bg-primary/10"
          >
            <Plus className="h-3 w-3" aria-hidden />
            Add option
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-7 items-center rounded-md px-2 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-7 items-center rounded-md bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Opening…" : "Open poll"}
        </button>
      </div>
    </form>
  );
}

function PollCard({
  poll,
  isTutor,
  onVote,
  onClose,
}: {
  poll: PollView;
  isTutor: boolean;
  onVote: (optionIndex: number) => void;
  onClose: () => void;
}) {
  const closed = Boolean(poll.closedAt);
  const showResults = closed || isTutor || poll.myVote !== null;
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{poll.question}</p>
        {isTutor && !closed && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-6 items-center rounded-md bg-muted px-2 text-[10px] font-semibold text-foreground hover:bg-muted/70"
          >
            Close
          </button>
        )}
        {closed && (
          <span className="chip chip-neutral text-[10px]">Closed</span>
        )}
      </div>
      <ul className="mt-2 space-y-1.5">
        {poll.results.map((bucket) => {
          const pct =
            poll.totalVotes > 0
              ? Math.round((bucket.count / poll.totalVotes) * 100)
              : 0;
          const mine = poll.myVote === bucket.index;
          const canVote = !isTutor && !closed;
          return (
            <li key={bucket.index}>
              {canVote ? (
                <button
                  type="button"
                  onClick={() => onVote(bucket.index)}
                  className={`flex w-full items-center justify-between rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    mine
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {mine && <Check className="h-3 w-3 text-primary" aria-hidden />}
                    {bucket.label}
                  </span>
                  {showResults && (
                    <span className="shrink-0 text-muted-foreground">
                      {pct}% · {bucket.count}
                    </span>
                  )}
                </button>
              ) : (
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 truncate">
                      {mine && <Check className="h-3 w-3 text-primary" aria-hidden />}
                      {bucket.label}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {pct}% · {bucket.count}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
      </p>
    </div>
  );
}
