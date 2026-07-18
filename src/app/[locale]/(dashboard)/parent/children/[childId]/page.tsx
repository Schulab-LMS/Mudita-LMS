import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getChildren } from "@/services/user.service";
import { getUserEnrollments } from "@/services/enrollment.service";
import { getStudentAssignments } from "@/services/tutor-assignment.service";
import { isMinor } from "@/lib/compliance";
import {
  getActiveSubscriptionTier,
  tierSatisfies,
} from "@/lib/subscription-access";
import { tenantScope } from "@/lib/tenant";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { CategoryIcon } from "@/components/illustrations/category-icons";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getInitials } from "@/lib/utils";
import { ConsentPanel } from "./consent-panel";
import { EnrollChildPanel } from "./enroll-child-panel";
import { ChildDateOfBirthForm } from "./child-date-of-birth-form";

interface ChildDetailPageProps {
  params: Promise<{ childId: string }>;
}

export default async function ChildDetailPage({
  params,
}: ChildDetailPageProps) {
  const { childId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const children = await getChildren(session.user.id);
  const child = children.find((c) => c.id === childId);
  if (!child) notFound();

  const [enrollments, tutorAssignments] = await Promise.all([
    getUserEnrollments(childId),
    getStudentAssignments(childId),
  ]);
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const active = enrollments.filter((e) => e.status === "ACTIVE").length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length
        )
      : 0;

  // Compliance + enrolment data feeding the parent panels below.
  const [latestConsent, parentTier, candidateCourses] = await Promise.all([
    db.consentRecord.findFirst({
      where: {
        userId: childId,
        type: { in: ["PARENTAL_COPPA", "PARENTAL_GDPR_K"] },
      },
      orderBy: { grantedAt: "desc" },
      select: { granted: true, grantedAt: true },
    }),
    getActiveSubscriptionTier(session.user.id),
    db.course.findMany({
      where: {
        status: "PUBLISHED",
        AND: [tenantScope({ role: "STUDENT", organizationId: child.organizationId })],
        NOT: { enrollments: { some: { userId: childId } } },
      },
      select: {
        id: true,
        title: true,
        isFree: true,
        requiredPlan: true,
        price: true,
        currency: true,
      },
      orderBy: { title: "asc" },
      take: 50,
    }),
  ]);

  const childIsMinor = child.dateOfBirth ? isMinor(child.dateOfBirth) : true;
  const hasActiveConsent = Boolean(latestConsent?.granted);
  const consentRequired = childIsMinor && !hasActiveConsent;
  const dobMissing = !child.dateOfBirth;

  // Surface three classes of course: free (direct enrol), subscription-
  // included that the parent's plan entitles, and legacy paid courses
  // (price > 0 with no explicit requiredPlan — now subscription-only at the
  // lowest paid tier). Subscription-tier courses the parent does NOT have
  // are filtered out — clicking would dead-end.
  const enrollableCourses = candidateCourses
    .map((c) => {
      // Zero price alone no longer means free — subscription courses are priced
      // at 0 and gated by requiredPlan.
      const isFree = c.isFree || (Number(c.price) === 0 && !c.requiredPlan);
      let kind: "free" | "subscription" | "paid";
      if (isFree) {
        kind = "free";
      } else if (c.requiredPlan) {
        kind = "subscription";
      } else {
        kind = "paid";
      }
      return {
        id: c.id,
        title: c.title,
        isFree,
        requiredPlan: c.requiredPlan,
        price: Number(c.price),
        currency: c.currency ?? "USD",
        kind,
      };
    })
    .filter((c) => {
      if (c.kind === "subscription") {
        return Boolean(parentTier && tierSatisfies(parentTier, c.requiredPlan!));
      }
      return true;
    });

  const enrolDisabledReason = dobMissing
    ? "Add a date of birth for this child first."
    : consentRequired
      ? "Grant parental consent first."
      : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${child.name}'s progress`}
        description={`${enrollments.length} course${
          enrollments.length === 1 ? "" : "s"
        } enrolled · ${completed} completed · ${active} active`}
        breadcrumbs={[
          { label: "Parent", href: "/parent" },
          { label: "Children", href: "/parent/children" },
          { label: child.name },
        ]}
        icon={
          <Avatar
            src={child.avatar ?? undefined}
            alt={child.name}
            fallback={getInitials(child.name)}
            size="md"
          />
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active"
          value={active}
          icon={BookOpen}
          tone="primary"
          description="In progress"
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={Trophy}
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

      {/* Parental controls */}
      <ChildDateOfBirthForm
        childId={child.id}
        childName={child.name}
        initialDateOfBirth={
          child.dateOfBirth?.toISOString().slice(0, 10) ?? ""
        }
      />
      {childIsMinor && (
        <ConsentPanel
          childId={child.id}
          childName={child.name}
          hasActiveConsent={hasActiveConsent}
          consentGrantedAt={latestConsent?.grantedAt ?? null}
          defaultType="PARENTAL_GDPR_K"
        />
      )}
      <EnrollChildPanel
        childId={child.id}
        childName={child.name}
        courses={enrollableCourses}
        disabled={Boolean(enrolDisabledReason)}
        disabledReason={enrolDisabledReason}
      />

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tutor assignments</h2>
          <p className="mt-1 text-xs text-muted-foreground">Published tasks, submission status, feedback, and grades for {child.name}.</p>
        </div>
        {tutorAssignments.length === 0 ? (
          <div className="card-premium p-5 text-sm text-muted-foreground">No tutor assignments yet.</div>
        ) : (
          tutorAssignments.map((assignment) => {
            const submission = assignment.submissions[0] ?? null;
            const quizAttempt = assignment.quizAttempts[0] ?? null;
            return (
              <article key={assignment.id} className="card-premium p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-xs text-muted-foreground">{assignment.course.title} · {assignment.tutor.user.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignment.status === "CLOSED" && <span className="chip chip-accent">closed</span>}
                    {quizAttempt && <span className={quizAttempt.passed ? "chip chip-success" : "chip chip-accent"}>{quizAttempt.score}% · {quizAttempt.passed ? "passed" : "not passed"}</span>}
                    <span className={submission?.status === "REVIEWED" ? "chip chip-success" : submission ? "chip chip-accent" : "chip chip-neutral"}>
                      {submission?.status.toLowerCase() ?? (quizAttempt ? "auto-graded" : "not submitted")}
                    </span>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{assignment.instructions}</p>
                {submission?.feedback && (
                  <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Tutor feedback{submission.points != null ? ` · ${submission.points}/${assignment.maxPoints}` : ""}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{submission.feedback}</p>
                  </div>
                )}
                {quizAttempt && (
                  <div className="mt-4 rounded-xl border border-blue-300 bg-blue-50/60 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">Automatic quiz result · {quizAttempt.earnedPoints}/{quizAttempt.totalPoints} points</p>
                    <p className="mt-1 text-sm">Score: {quizAttempt.score}% · {quizAttempt.passed ? "Passed" : "Not passed yet"}</p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      {/* Courses */}
      {enrollments.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No courses enrolled yet"
          description={`Help ${child.name} pick a first course to start their learning journey.`}
          action={{ label: "Browse courses", href: "/courses" }}
          tone="first-use"
          size="lg"
        />
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Courses
          </h2>
          {enrollments.map((enrollment) => {
            const isDone = enrollment.status === "COMPLETED";
            const allLessons = enrollment.course.modules.flatMap(
              (m) => m.lessons
            );
            const firstLessonId = allLessons[0]?.id;
            return (
              <div
                key={enrollment.id}
                className="card-premium flex items-center gap-4 p-4"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-launch-gradient-soft">
                  <CategoryIcon
                    category={enrollment.course.category ?? "rocket"}
                    size={40}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">
                      {enrollment.course.title}
                    </h3>
                    {isDone ? (
                      <span className="chip chip-success">
                        <CheckCircle2 className="h-3 w-3" aria-hidden />
                        Completed
                      </span>
                    ) : (
                      <span className="chip chip-primary">
                        <PlayCircle className="h-3 w-3" aria-hidden />
                        In progress
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress
                      value={enrollment.progress}
                      className="h-1.5 flex-1 max-w-md"
                    />
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {enrollment.progress}%
                    </span>
                  </div>
                </div>
                {firstLessonId && (
                  <Link
                    href={`/student/learn/${enrollment.course.slug}/${firstLessonId}`}
                    className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    {isDone ? "Review" : "Resume"}
                    <ArrowRight
                      className="h-3 w-3 rtl:rotate-180"
                      aria-hidden
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
