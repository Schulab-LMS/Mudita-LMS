import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import {
  listAiContentQueue,
  aiContentCounts,
} from "@/services/ai-content-review.service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResultsScene } from "@/components/illustrations/empty-scenes";
import type { AiContentStatus } from "@/generated/prisma/client";
import { AiContentActions } from "./ai-content-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.aiContent");
  return { title: t("pageTitle") };
}

// Lifecycle badge colours — review-actionable states warm, APPROVED green.
const STATUS_COLORS: Record<AiContentStatus, string> = {
  SOURCE_COLLECTED:
    "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/25",
  AI_GENERATED:
    "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25",
  UNDER_REVIEW:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25",
  REVISION_NEEDED:
    "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/25",
  APPROVED:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
};

const STATUS_TILE_ORDER: AiContentStatus[] = [
  "REVISION_NEEDED",
  "UNDER_REVIEW",
  "AI_GENERATED",
  "SOURCE_COLLECTED",
  "APPROVED",
];

export default async function AdminAiContentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tCommon, locale, items, counts] = await Promise.all([
    getTranslations("admin.aiContent"),
    getTranslations("admin.common"),
    getLocale(),
    listAiContentQueue(),
    aiContentCounts(),
  ]);

  const dateFmt = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: t("title") }]}
      />

      {/* Lifecycle summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUS_TILE_ORDER.map((status) => (
          <div key={status} className="card-premium p-4 text-center">
            <div className="font-display text-2xl font-bold text-foreground">
              {counts[status]}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t(`status.${status}`)}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          illustration={<NoResultsScene />}
          title={t("empty")}
          description={t("emptyHint")}
          tone="default"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("colLesson")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("status")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("colModel")}
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("colSources")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("colVerified")}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.lessonId}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">
                        {item.lessonTitle}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.courseTitle} · {item.moduleTitle}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[item.aiStatus]}`}
                      >
                        {t(`status.${item.aiStatus}`)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {item.aiModel ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex min-w-[2rem] items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          item.citationCount > 0
                            ? "bg-muted text-foreground"
                            : "bg-red-500/15 text-red-700 dark:text-red-300"
                        }`}
                        title={
                          item.citationCount === 0
                            ? t("noCitationsWarning")
                            : undefined
                        }
                      >
                        {item.citationCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {item.lastVerifiedAt
                        ? dateFmt.format(item.lastVerifiedAt)
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <AiContentActions
                        lessonId={item.lessonId}
                        currentStatus={item.aiStatus}
                        canApprove={item.citationCount > 0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
