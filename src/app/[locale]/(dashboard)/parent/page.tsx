import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getChildren } from "@/services/user.service";
import { ChildCard } from "@/components/dashboard/child-card";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  ArrowRight,
  Calendar,
  UserPlus,
} from "lucide-react";

export const metadata = { title: "Parent Dashboard | Schulab" };

type ChildWithEnrollments = Awaited<ReturnType<typeof getChildren>>[number];

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const [t, children] = await Promise.all([
    getTranslations("parentDashboard"),
    getChildren(session.user.id),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "";

  // Aggregate metrics across all children
  type E = ChildWithEnrollments["enrollments"][number];
  const allEnrollments = children.flatMap((c) => c.enrollments);
  const totalEnrollments = allEnrollments.length;
  const completed = allEnrollments.filter(
    (e: E) => e.status === "COMPLETED"
  ).length;
  const active = allEnrollments.filter(
    (e: E) => e.status === "ACTIVE"
  ).length;
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          allEnrollments.reduce((sum: number, e: E) => sum + e.progress, 0) /
            totalEnrollments
        )
      : 0;

  // Top in-progress courses across all children (best 3)
  const topInProgress = children
    .flatMap((c) =>
      c.enrollments
        .filter((e: E) => e.status === "ACTIVE" && e.progress < 100)
        .map((e: E) => ({
          childName: c.name,
          childId: c.id,
          courseTitle: e.course.title,
          progress: e.progress,
        }))
    )
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("welcomeBack", { name: firstName })}
        description={t("childrenLinked", { count: children.length })}
        actions={
          children.length > 0 ? (
            <Link
              href="/parent/children"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Users className="h-3.5 w-3.5" aria-hidden />
              {t("manageChildren")}
            </Link>
          ) : undefined
        }
      />

      {children.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title={t("noChildrenTitle")}
          description={t("noChildrenBody")}
          action={{ label: t("addChildCta"), href: "/parent/children" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <>
          {/* Top stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Children"
              value={children.length}
              icon={Users}
              tone="primary"
              description={`${children.length} linked account${
                children.length === 1 ? "" : "s"
              }`}
            />
            <StatCard
              label="Active enrollments"
              value={active}
              icon={GraduationCap}
              tone="secondary"
              description={`${totalEnrollments} total`}
            />
            <StatCard
              label="Completed courses"
              value={completed}
              icon={Award}
              tone="success"
              description="Certificates earned"
            />
            <StatCard
              label="Overall progress"
              value={`${avgProgress}%`}
              icon={TrendingUp}
              tone="accent"
              description="Across all courses"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Children cards */}
            <section className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {t("yourChildren")}
                </h2>
                <Link
                  href="/parent/children"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <UserPlus className="h-3 w-3" aria-hidden />
                  Add child
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {children.map((child) => (
                  <ChildCard key={child.id} child={child} />
                ))}
              </div>
            </section>

            {/* Continue learning + quick actions */}
            <aside className="space-y-4">
              <div className="card-premium p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Continue learning
                </p>
                {topInProgress.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No in-progress courses yet.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {topInProgress.map((item, i) => (
                      <li key={`${item.childId}-${i}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.courseTitle}
                          </p>
                          <span className="shrink-0 text-xs font-semibold text-primary">
                            {item.progress}%
                          </span>
                        </div>
                        <p className="mb-1 text-[11px] text-muted-foreground">
                          {item.childName}
                        </p>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-launch-gradient-horizontal"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card-premium p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick actions
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <QuickLink
                    href="/courses"
                    icon={<GraduationCap className="h-4 w-4" />}
                  >
                    Browse courses
                  </QuickLink>
                  <QuickLink
                    href="/tutors"
                    icon={<Users className="h-4 w-4" />}
                  >
                    Find a tutor
                  </QuickLink>
                  <QuickLink
                    href="/parent/children"
                    icon={<UserPlus className="h-4 w-4" />}
                  >
                    Manage children
                  </QuickLink>
                  <QuickLink
                    href="/stem-kits"
                    icon={<Calendar className="h-4 w-4" />}
                  >
                    Order STEM kits
                  </QuickLink>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="flex-1 font-medium text-foreground">{children}</span>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
