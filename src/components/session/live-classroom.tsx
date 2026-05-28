"use client";

import {
  LiveKitRoom,
  useDataChannel,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Hand, MessageCircle, Send, Users } from "lucide-react";

import {
  RevealPresentation,
  type SlidePosition,
} from "@/components/course/reveal-presentation";
import { ProtectedContent } from "@/components/shared/protected-content";
import type { PresentationConfig } from "@/lib/presentation";
import {
  recordChatMessage,
  recordHandState,
  recordSlideChange,
} from "@/actions/live-classroom.actions";

// LiveClassroom is the client-side core of a Phase-2 tutor-led session:
//
//   * Wraps the page in <LiveKitRoom> with a server-issued token (data-only
//     connection — A/V publishing is a P3 escalation).
//   * Renders a Reveal.js deck in presenter or follower mode depending on the
//     caller's role. The tutor drives slide navigation; followers mirror it.
//   * Carries chat, raise-hand, and slide-sync over LiveKit data channels
//     (one channel, three topics). Each event is also persisted to
//     ClassroomEvent via a server action so late joiners can hydrate.
//
// The component is intentionally one file. The session is a tightly coupled
// state machine (slide + chat + hand + presence) and a per-piece split would
// just shuffle props between three sibling components without untangling the
// coupling. P3 (polls / annotations / A/V tile grid) is where breaking up
// makes sense.

type Role = "TUTOR" | "STUDENT";

export interface ChatMessageView {
  id: string;
  userId: string | null;
  name: string | null;
  body: string;
  // Date on the server; string after JSON serialisation through props. We
  // accept both and normalise in the renderer.
  createdAt: Date | string;
}

interface LiveClassroomProps {
  bookingId: string;
  token: string;
  livekitUrl: string;
  role: Role;
  selfId: string;
  selfName: string;
  initialSlide: SlidePosition | null;
  initialChat: ChatMessageView[];
  presentationMarkdown: string | null;
  presentationConfig: PresentationConfig | null;
  watermark: string | undefined;
  rtl: boolean;
}

export function LiveClassroom(props: LiveClassroomProps) {
  return (
    <LiveKitRoom
      token={props.token}
      serverUrl={props.livekitUrl}
      connect
      audio={false}
      video={false}
      // We don't publish or subscribe to media tracks in P2 — the room is
      // purely a data-channel transport.
    >
      <LiveClassroomBody {...props} />
    </LiveKitRoom>
  );
}

// ───────────────────────────── Body (inside the room) ─────────────────────

function LiveClassroomBody(props: LiveClassroomProps) {
  const isTutor = props.role === "TUTOR";
  const room = useRoomContext();
  const participants = useParticipants();
  const [currentSlide, setCurrentSlide] = useState<SlidePosition | null>(
    props.initialSlide
  );
  const currentSlideRef = useRef<SlidePosition | null>(props.initialSlide);

  // ── Slide sync ────────────────────────────────────────────────────
  const { send: sendSlide } = useDataChannel("slide", (msg) => {
    // Tutors are the source of truth; ignore inbound slide events on the
    // tutor's own client (avoids loops if a stale message arrives).
    if (isTutor) return;
    const parsed = decodeJson(msg.payload);
    if (
      parsed &&
      typeof parsed.h === "number" &&
      typeof parsed.v === "number" &&
      typeof parsed.f === "number"
    ) {
      const slide = { h: parsed.h, v: parsed.v, f: parsed.f };
      setCurrentSlide(slide);
      currentSlideRef.current = slide;
    }
  });

  const broadcastSlide = useCallback(
    async (slide: SlidePosition) => {
      const payload = encodeJson(slide);
      try {
        await sendSlide(payload, { reliable: true, topic: "slide" });
      } catch (e) {
        console.warn("[live-classroom] slide broadcast failed:", e);
      }
      // Persist server-side for late joiners / refresh resilience.
      const result = await recordSlideChange(props.bookingId, slide);
      if (!result.success) {
        console.warn("[live-classroom] slide persist failed:", result.error);
      }
    },
    [sendSlide, props.bookingId]
  );

  const onPresenterSlideChange = useCallback(
    (slide: SlidePosition) => {
      currentSlideRef.current = slide;
      setCurrentSlide(slide);
      void broadcastSlide(slide);
    },
    [broadcastSlide]
  );

  // Tutor: re-broadcast the current slide to new joiners. Cheaper than a
  // sync:request round-trip and good enough until P3 needs a richer
  // presence/state protocol.
  useEffect(() => {
    if (!isTutor || !room) return;
    const onJoin = () => {
      const slide = currentSlideRef.current;
      if (!slide) return;
      sendSlide(encodeJson(slide), { reliable: true, topic: "slide" }).catch(
        () => null
      );
    };
    room.on(RoomEvent.ParticipantConnected, onJoin);
    return () => {
      room.off(RoomEvent.ParticipantConnected, onJoin);
    };
  }, [isTutor, room, sendSlide]);

  // ── Chat ──────────────────────────────────────────────────────────
  const [chat, setChat] = useState<ChatMessageView[]>(props.initialChat);
  const { send: sendChat } = useDataChannel("chat", (msg) => {
    const parsed = decodeJson(msg.payload);
    if (!parsed) return;
    setChat((prev) => [
      ...prev,
      {
        id: `${msg.from?.identity ?? "anon"}-${prev.length}-${Date.now()}`,
        userId: typeof parsed.userId === "string" ? parsed.userId : msg.from?.identity ?? null,
        name:
          typeof parsed.name === "string"
            ? parsed.name
            : msg.from?.name ?? null,
        body: typeof parsed.body === "string" ? parsed.body : "",
        createdAt: new Date(),
      },
    ]);
  });

  const sendChatMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      // Optimistic local append so the sender sees their own message
      // immediately — the data channel doesn't echo to the publisher.
      setChat((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}-${prev.length}`,
          userId: props.selfId,
          name: props.selfName,
          body: trimmed,
          createdAt: new Date(),
        },
      ]);
      try {
        await sendChat(
          encodeJson({ userId: props.selfId, name: props.selfName, body: trimmed }),
          { reliable: true, topic: "chat" }
        );
      } catch (e) {
        console.warn("[live-classroom] chat send failed:", e);
      }
      const result = await recordChatMessage(props.bookingId, trimmed, props.selfName);
      if (!result.success) {
        console.warn("[live-classroom] chat persist failed:", result.error);
      }
    },
    [sendChat, props.bookingId, props.selfId, props.selfName]
  );

  // ── Raise hand ────────────────────────────────────────────────────
  const [handsRaised, setHandsRaised] = useState<Set<string>>(new Set());
  const [myHandRaised, setMyHandRaised] = useState(false);
  const { send: sendHand } = useDataChannel("hand", (msg) => {
    const parsed = decodeJson(msg.payload);
    const userId = (parsed?.userId as string | undefined) ?? msg.from?.identity;
    if (!userId) return;
    setHandsRaised((prev) => {
      const next = new Set(prev);
      if (parsed?.raised) next.add(userId);
      else next.delete(userId);
      return next;
    });
  });

  const toggleHand = useCallback(async () => {
    const next = !myHandRaised;
    setMyHandRaised(next);
    setHandsRaised((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(props.selfId);
      else updated.delete(props.selfId);
      return updated;
    });
    try {
      await sendHand(
        encodeJson({ userId: props.selfId, raised: next }),
        { reliable: true, topic: "hand" }
      );
    } catch (e) {
      console.warn("[live-classroom] hand send failed:", e);
    }
    await recordHandState(props.bookingId, next);
  }, [sendHand, myHandRaised, props.bookingId, props.selfId]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div className="min-w-0 space-y-4">
        {props.presentationMarkdown ? (
          <ProtectedContent
            className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg"
            watermark={props.watermark}
          >
            <RevealPresentation
              markdown={props.presentationMarkdown}
              config={props.presentationConfig}
              mode={isTutor ? "presenter" : "follower"}
              rtl={props.rtl}
              currentSlide={isTutor ? null : currentSlide}
              onSlideChange={isTutor ? onPresenterSlideChange : undefined}
            />
          </ProtectedContent>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
            {isTutor
              ? "Pick a lesson with a presentation to start the deck."
              : "Waiting for the tutor to share slides."}
          </div>
        )}
        {isTutor && currentSlide && (
          <p className="text-xs text-muted-foreground">
            Slide {currentSlide.h + 1}
            {currentSlide.v > 0 && `.${currentSlide.v + 1}`} · students follow you
          </p>
        )}
      </div>
      <aside className="space-y-4">
        <RosterPanel
          participants={participants.map((p) => ({
            id: p.identity,
            name: p.name ?? p.identity,
            isLocal: p.isLocal,
          }))}
          handsRaised={handsRaised}
          isTutor={isTutor}
        />
        {!isTutor && <RaiseHandButton raised={myHandRaised} onToggle={toggleHand} />}
        <ChatPanel
          messages={chat}
          onSend={sendChatMessage}
          selfId={props.selfId}
        />
      </aside>
    </div>
  );
}

// ───────────────────────────── Roster ─────────────────────────────────────

function RosterPanel({
  participants,
  handsRaised,
  isTutor,
}: {
  participants: { id: string; name: string; isLocal: boolean }[];
  handsRaised: Set<string>;
  isTutor: boolean;
}) {
  return (
    <div className="card-premium overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Users className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">
          In the room · {participants.length}
        </h2>
      </div>
      <ul className="max-h-48 divide-y divide-border overflow-y-auto">
        {participants.length === 0 && (
          <li className="px-4 py-3 text-xs text-muted-foreground">
            Connecting…
          </li>
        )}
        {participants.map((p) => {
          const raised = handsRaised.has(p.id);
          return (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 px-4 py-2 text-sm"
            >
              <span className="truncate">
                {p.name}
                {p.isLocal && (
                  <span className="ms-1 text-[10px] text-muted-foreground">
                    (you)
                  </span>
                )}
              </span>
              {raised && (
                <span
                  title={isTutor ? "Hand raised — ready to speak" : "Hand raised"}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300"
                >
                  <Hand className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────────────────────────── Raise-hand ─────────────────────────────────

function RaiseHandButton({
  raised,
  onToggle,
}: {
  raised: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
        raised
          ? "bg-amber-500 text-white hover:bg-amber-600"
          : "bg-muted text-foreground hover:bg-muted/70"
      }`}
    >
      <Hand className="h-4 w-4" aria-hidden />
      {raised ? "Lower hand" : "Raise hand"}
    </button>
  );
}

// ───────────────────────────── Chat ───────────────────────────────────────

function ChatPanel({
  messages,
  onSend,
  selfId,
}: {
  messages: ChatMessageView[];
  onSend: (body: string) => void;
  selfId: string;
}) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom on new messages, but only when the user is
  // already near the bottom (so reading scrollback isn't interrupted).
  const lastCount = useRef(messages.length);
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (messages.length > lastCount.current && nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
    lastCount.current = messages.length;
  }, [messages.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  const onTextareaKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!draft.trim()) return;
      onSend(draft);
      setDraft("");
    }
  };

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  return (
    <div className="card-premium overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
        <h2 className="text-sm font-semibold text-foreground">Chat</h2>
      </div>
      <div ref={scrollRef} className="h-64 overflow-y-auto px-3 py-2">
        {messages.length === 0 && (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            No messages yet. Say hi 👋
          </p>
        )}
        <ul className="space-y-2">
          {messages.map((m) => {
            const mine = m.userId === selfId;
            const time = new Date(m.createdAt);
            return (
              <li key={m.id} className={mine ? "text-end" : ""}>
                <div
                  className={`inline-block max-w-[90%] rounded-lg px-3 py-1.5 text-xs leading-snug ${
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {!mine && m.name && (
                    <div className="text-[10px] font-semibold opacity-70">
                      {m.name}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className="mt-0.5 text-[10px] opacity-60">
                    {fmt.format(time)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <form
        onSubmit={submit}
        className="flex items-end gap-2 border-t border-border p-2"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onTextareaKey}
          rows={1}
          maxLength={2000}
          placeholder="Message"
          className="block max-h-24 min-h-9 w-full resize-none rounded-lg border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
        </button>
      </form>
    </div>
  );
}

// ───────────────────────────── helpers ────────────────────────────────────

function encodeJson(value: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(value));
}

function decodeJson(bytes: Uint8Array): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
