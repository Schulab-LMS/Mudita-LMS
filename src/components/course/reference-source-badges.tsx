import { ExternalLink } from "lucide-react";

export type ReferenceSourceBadge = {
  name: string;
  url: string;
  provider: string;
  sourceType: string;
  status: "ACTIVE" | "HISTORICAL" | "OPTIONAL" | "ENRICHMENT";
};

const STATUS_LABEL: Record<ReferenceSourceBadge["status"], string | null> = {
  ACTIVE: null,
  HISTORICAL: "Historical",
  OPTIONAL: "Optional",
  ENRICHMENT: "Enrichment",
};

const STATUS_CHIP: Record<ReferenceSourceBadge["status"], string> = {
  ACTIVE: "",
  HISTORICAL: "bg-gray-100 text-gray-500",
  OPTIONAL: "bg-amber-50 text-amber-700",
  ENRICHMENT: "bg-indigo-50 text-indigo-700",
};

/**
 * Renders the reputable external sources a course / bundle / pathway is aligned
 * with, as clickable "source badges". Server-component friendly (no client
 * hooks). Pass localized `heading`/`note` from getTranslations; sensible English
 * defaults keep it usable without wiring i18n.
 */
export function ReferenceSourceBadges({
  sources,
  heading = "Learning sources & references",
  note = "Content is aligned with these trusted, free educational sources.",
  className = "",
}: {
  sources: ReferenceSourceBadge[];
  heading?: string;
  note?: string;
  className?: string;
}) {
  if (!sources?.length) return null;

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-5 ${className}`}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">{heading}</h2>
      {note ? <p className="mt-1 text-xs text-gray-500">{note}</p> : null}
      <ul className="mt-3 flex flex-wrap gap-2">
        {sources.map((s) => {
          const statusLabel = STATUS_LABEL[s.status];
          return (
            <li key={`${s.name}-${s.url}`}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={`${s.provider} — ${s.sourceType}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-800 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <span>{s.name}</span>
                {statusLabel ? (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${STATUS_CHIP[s.status]}`}>
                    {statusLabel}
                  </span>
                ) : null}
                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
