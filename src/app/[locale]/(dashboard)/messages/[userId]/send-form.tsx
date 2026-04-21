"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { sendMessageAction } from "@/actions/message.actions";
import { Send } from "lucide-react";

interface Props {
  receiverId: string;
}

export function SendForm({ receiverId }: Props) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = useTranslations("messages");

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [body]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await sendMessageAction({ receiverId, body: body.trim() });
      if (result.success) {
        setBody("");
      } else {
        setError(result.error ?? t("sendFailed"));
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-4">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("typePlaceholder")}
          rows={1}
          disabled={pending}
          className="flex-1 resize-none rounded-xl border border-input bg-muted/30 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
          aria-label={t("sendAria")}
        >
          {pending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4 rtl:-scale-x-100" />
          )}
        </button>
      </div>
    </form>
  );
}
