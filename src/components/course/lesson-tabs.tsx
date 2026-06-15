"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, FileText, MessageSquare, NotebookPen } from "lucide-react";

type TabKey = "overview" | "notes" | "resources" | "qa";

interface LessonTabsProps {
  overview: ReactNode;
  notes: ReactNode;
  resources: ReactNode;
  qa: ReactNode;
  resourceCount: number;
  questionCount: number;
}

// Client tab switcher for the lesson content panel. Each tab's content is
// rendered on the server and passed in as a node, so interactive panels (Notes,
// Q&A) stay client components while Overview/Resources can be server-rendered.
export function LessonTabs({
  overview,
  notes,
  resources,
  qa,
  resourceCount,
  questionCount,
}: LessonTabsProps) {
  const [active, setActive] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string; icon: ReactNode; count?: number }[] = [
    { key: "overview", label: "Overview", icon: <FileText className="h-3.5 w-3.5" /> },
    { key: "notes", label: "Notes", icon: <NotebookPen className="h-3.5 w-3.5" /> },
    {
      key: "resources",
      label: "Resources",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      count: resourceCount,
    },
    {
      key: "qa",
      label: "Q&A",
      icon: <MessageSquare className="h-3.5 w-3.5" />,
      count: questionCount,
    },
  ];

  return (
    <div className="card-premium overflow-hidden">
      <div
        className="flex items-center gap-1 overflow-x-auto border-b border-border px-2"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className={`relative inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count ? (
              <span className="chip chip-neutral ms-1 px-1.5 py-0 text-[9px]">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div role="tabpanel" hidden={active !== "overview"}>
          {overview}
        </div>
        <div role="tabpanel" hidden={active !== "notes"}>
          {notes}
        </div>
        <div role="tabpanel" hidden={active !== "resources"}>
          {resources}
        </div>
        <div role="tabpanel" hidden={active !== "qa"}>
          {qa}
        </div>
      </div>
    </div>
  );
}
