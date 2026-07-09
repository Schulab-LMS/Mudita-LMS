import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { getPortfolioSubmissions } from "@/services/activity.service";
import { getLocalizedField } from "@/services/course.service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { Briefcase, MessageSquare, ExternalLink } from "lucide-react";

export const metadata = { title: "Portfolio" };

export default async function StudentPortfolioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [locale, submissions] = await Promise.all([
    getLocale(),
    getPortfolioSubmissions(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio"
        description={`${submissions.length} capstone project${submissions.length === 1 ? "" : "s"}`}
        breadcrumbs={[{ label: "Portfolio" }]}
        icon={<Briefcase className="h-5 w-5" />}
      />

      {submissions.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No projects yet"
          description="Finish a bundle and submit its final project to start building your portfolio."
          action={{ label: "Browse bundles", href: "/bundles" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {submissions.map((s) => {
            const bundleTitle = s.bundle ? getLocalizedField(s.bundle, "title", locale) : "Bundle";
            return (
              <div key={s.id} className="card-premium space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold leading-tight">{bundleTitle}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${s.status === "REVIEWED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {s.status === "REVIEWED" ? "Reviewed" : "Submitted"}
                  </span>
                </div>

                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                  {s.content}
                </p>

                {s.feedback && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden /> Feedback
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{s.feedback}</p>
                  </div>
                )}

                {s.bundle && (
                  <Link
                    href={`/bundles/${s.bundle.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open bundle
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
