// Pure formatting helpers shared by the public events pages, the dashboard
// widget and the completion card. No React / no Date.now() so they stay safe to
// call inside server-component render bodies (React Compiler purity).

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const REGION_LABEL: Record<string, string> = {
  GLOBAL: "Global",
  EUROPE: "Europe",
  GERMANY: "Germany",
  US: "US",
  UK: "UK",
};

export function ageRangeLabel(min: number | null, max: number | null): string {
  if (min == null && max == null) return "All ages";
  if (min != null && max != null) return `Ages ${min}–${max}`;
  if (min != null) return `Ages ${min}+`;
  return `Up to ${max}`;
}

export function levelRangeLabel(min: string | null, max: string | null): string {
  const lo = min ? LEVEL_LABEL[min] : null;
  const hi = max ? LEVEL_LABEL[max] : null;
  if (lo && hi) return lo === hi ? lo : `${lo} → ${hi}`;
  return lo ?? hi ?? "All levels";
}

export function regionLabel(region: string | null): string {
  return region ? REGION_LABEL[region] ?? region : "Global";
}

/** Collapses a month list into a compact human range, e.g. [9,10,11,12,1,2,3]
 *  → "Sep–Mar". Falls back to a comma list for non-contiguous spans. */
export function seasonLabel(months: number[]): string {
  if (!months || months.length === 0) return "";
  if (months.length === 1) return MONTHS[months[0] - 1];
  if (months.length >= 12) return "Year-round";
  // The seed lists months in chronological run order (may wrap past December),
  // so the first and last entries are the natural range endpoints.
  const first = months[0];
  const last = months[months.length - 1];
  return `${MONTHS[first - 1]}–${MONTHS[last - 1]}`;
}

/** Tailwind classes for a listing-status badge. */
export function listingTone(status: string): string {
  switch (status) {
    case "OPTIONAL":
      return "bg-amber-100 text-amber-800";
    case "ARCHIVED":
      return "bg-slate-200 text-slate-600";
    default:
      return "bg-emerald-100 text-emerald-800";
  }
}
