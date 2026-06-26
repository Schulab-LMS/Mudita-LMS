"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { AGE_GROUPS } from "@/lib/constants";

const AGE_GROUP_VALUES = ["", ...AGE_GROUPS.map((g) => g.value)] as const;

const CATEGORY_VALUES = [
  "",
  "MATH",
  "SCIENCE",
  "TECHNOLOGY",
  "ENGINEERING",
  "ARTS",
  "CODING",
  "ROBOTICS",
] as const;

const LEVEL_VALUES = ["", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

// Duration buckets, value = upper bound in MINUTES (consumed by getCourses,
// which converts to seconds). Empty value clears the filter.
const DURATION_BUCKETS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "", label: "Any duration" },
  { value: "120", label: "Under 2h" },
  { value: "360", label: "2–6h" },
  { value: "100000", label: "6h+" },
];

type ReferenceSourceOption = { key: string; name: string };

export function CourseFilters({
  sources = [],
}: {
  sources?: ReferenceSourceOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("courses.filters");
  const tAge = useTranslations("courses.ageGroups");
  const tCat = useTranslations("courses.categories");
  const tLevel = useTranslations("courses.levels");

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
      {/* Search lives in the page hero (single search bar); filters only here. */}

      {/* Age Group */}
      <select
        aria-label={t("ageGroupLabel")}
        defaultValue={searchParams.get("ageGroup") ?? ""}
        onChange={(e) => updateParam("ageGroup", e.target.value)}
        className="input-pretty h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
      >
        {AGE_GROUP_VALUES.map((value) => (
          <option key={value || "all"} value={value}>
            {value ? tAge(value) : t("allAges")}
          </option>
        ))}
      </select>

      {/* Category */}
      <select
        aria-label={t("categoryLabel")}
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="input-pretty h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
      >
        {CATEGORY_VALUES.map((value) => (
          <option key={value || "all"} value={value}>
            {value ? tCat(value) : t("allCategories")}
          </option>
        ))}
      </select>

      {/* Level */}
      <select
        aria-label={t("levelLabel")}
        defaultValue={searchParams.get("level") ?? ""}
        onChange={(e) => updateParam("level", e.target.value)}
        className="input-pretty h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
      >
        {LEVEL_VALUES.map((value) => (
          <option key={value || "all"} value={value}>
            {value ? tLevel(value) : t("allLevels")}
          </option>
        ))}
      </select>

      {/* Reference source */}
      {sources.length > 0 && (
        <select
          aria-label="Learning source"
          defaultValue={searchParams.get("sourceKey") ?? ""}
          onChange={(e) => updateParam("sourceKey", e.target.value)}
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
        >
          <option value="">All sources</option>
          {sources.map((source) => (
            <option key={source.key} value={source.key}>
              {source.name}
            </option>
          ))}
        </select>
      )}

      {/* Duration */}
      <select
        aria-label="Duration"
        defaultValue={searchParams.get("maxDuration") ?? ""}
        onChange={(e) => updateParam("maxDuration", e.target.value)}
        className="input-pretty h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
      >
        {DURATION_BUCKETS.map((bucket) => (
          <option key={bucket.value || "any"} value={bucket.value}>
            {bucket.label}
          </option>
        ))}
      </select>

      {/* Certificate — every published course carries a completion certificate,
          so this toggle simply narrows to certificate-bearing courses. */}
      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm">
        <input
          type="checkbox"
          checked={searchParams.get("certificate") === "true"}
          onChange={(e) => updateParam("certificate", e.target.checked ? "true" : "")}
          className="h-4 w-4 rounded border-input"
        />
        <span>Certificate</span>
      </label>
    </div>
  );
}
