import {
  Download,
  ExternalLink,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Link2,
  Presentation,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import type { LessonResource } from "@/lib/curriculum-structure";

const ICONS: Record<LessonResource["type"], typeof FileText> = {
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  slides: Presentation,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
  code: FileCode,
  link: Link2,
  file: Download,
};

const LABELS: Record<LessonResource["type"], string> = {
  pdf: "PDF",
  doc: "Document",
  sheet: "Spreadsheet",
  slides: "Slides",
  image: "Image",
  video: "Video",
  audio: "Audio",
  archive: "Archive",
  code: "Code",
  link: "Link",
  file: "File",
};

// External links open in a new tab; proxied repo files (served under
// /api/curriculum/media) are same-origin downloads.
function isExternal(url: string): boolean {
  return /^([a-z]+:)?\/\//i.test(url) && !url.startsWith("/");
}

export function LessonResources({ resources }: { resources: LessonResource[] }) {
  if (resources.length === 0) {
    return (
      <EmptyState
        icon={<Download className="h-10 w-10" aria-hidden />}
        title="No resources yet"
        description="Downloads and reference links for this lesson will appear here when your tutor adds them."
        size="sm"
      />
    );
  }

  return (
    <ul className="space-y-2">
      {resources.map((r, i) => {
        const Icon = ICONS[r.type] ?? Download;
        const external = isExternal(r.url);
        return (
          <li key={`${r.url}-${i}`}>
            <a
              href={r.url}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-launch-gradient-soft text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                  {r.title}
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {LABELS[r.type] ?? "File"}
                </p>
              </div>
              {external ? (
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <Download className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
