"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
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

export function CourseFilters() {
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
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          placeholder={t("searchPlaceholder")}
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="input-pretty h-10 w-full rounded-lg border border-input bg-background py-2 ps-9 pe-3 text-sm focus-visible:outline-none"
        />
      </div>

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
    </div>
  );
}
