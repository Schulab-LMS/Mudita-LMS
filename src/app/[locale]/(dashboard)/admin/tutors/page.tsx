import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResultsScene } from "@/components/illustrations/empty-scenes";
import { RatingStars } from "@/components/ui/rating-stars";
import { GraduationCap, Clock, BadgeCheck } from "lucide-react";
import {
  VerifyTutorButton,
  RejectTutorButton,
  DeleteTutorButton,
} from "./tutor-actions";

export const metadata = { title: "Tutor Verification | Admin" };

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function AdminTutorsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role))
    redirect("/dashboard");

  let tutors: Awaited<
    ReturnType<
      typeof db.tutorProfile.findMany<{
        include: { user: { select: { name: true; email: true } } };
      }>
    >
  > = [];
  try {
    tutors = await db.tutorProfile.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { isVerified: "asc" },
    });
  } catch {
    /* db error */
  }

  const pending = tutors.filter((t) => !t.isVerified);
  const verified = tutors.filter((t) => t.isVerified);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutor Verification"
        description={`${pending.length} pending · ${verified.length} verified · ${tutors.length} total`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Tutor Verification" },
        ]}
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile
          label="Pending review"
          value={pending.length}
          tone="warning"
          icon={<Clock className="h-4 w-4" />}
        />
        <SummaryTile
          label="Verified"
          value={verified.length}
          tone="success"
          icon={<BadgeCheck className="h-4 w-4" />}
        />
        <SummaryTile
          label="Total applications"
          value={tutors.length}
          tone="primary"
          icon={<GraduationCap className="h-4 w-4" />}
        />
      </div>

      {/* Pending Applications */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Pending approval
            </h2>
            <span className="chip chip-accent">{pending.length}</span>
          </div>
          <div className="space-y-3">
            {pending.map((tutor) => (
              <div
                key={tutor.id}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/30 text-sm font-semibold text-foreground">
                      {initialsOf(tutor.user.name ?? "?")}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {tutor.user.name}
                        </h3>
                        <span className="chip chip-accent">Pending review</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tutor.user.email}
                      </p>
                      {tutor.headline && (
                        <p className="text-sm font-medium text-foreground">
                          {tutor.headline}
                        </p>
                      )}
                      {tutor.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {tutor.bio}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tutor.subjects.map((s) => (
                          <span key={s} className="chip chip-primary">
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          ${String(tutor.hourlyRate)}
                          <span className="font-normal text-muted-foreground">
                            /hr
                          </span>
                        </span>
                        {tutor.languages.length > 0 && (
                          <span>Teaches in {tutor.languages.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <VerifyTutorButton tutorId={tutor.id} />
                    <RejectTutorButton tutorId={tutor.id} />
                    <DeleteTutorButton
                      tutorId={tutor.id}
                      name={tutor.user.name ?? "this tutor"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verified Tutors */}
      {verified.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Verified tutors
            </h2>
            <span className="chip chip-success">{verified.length}</span>
          </div>
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tutor
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Subjects
                    </th>
                    <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rate
                    </th>
                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rating
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sessions
                    </th>
                    <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {verified.map((tutor) => (
                    <tr
                      key={tutor.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                            {initialsOf(tutor.user.name ?? "?")}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-medium text-foreground">
                                {tutor.user.name}
                              </p>
                              <BadgeCheck
                                className="h-4 w-4 shrink-0 text-primary"
                                aria-label="Verified"
                              />
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                              {tutor.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.slice(0, 3).map((s) => (
                            <span key={s} className="chip chip-primary">
                              {s}
                            </span>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <span className="chip chip-neutral">
                              +{tutor.subjects.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-end font-semibold text-foreground">
                        ${String(tutor.hourlyRate)}
                        <span className="ms-1 text-xs font-normal text-muted-foreground">
                          /hr
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {Number(tutor.rating) > 0 ? (
                          <RatingStars
                            value={Number(tutor.rating)}
                            size="sm"
                            showValue
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No ratings
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                          {tutor.totalSessions}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <RejectTutorButton tutorId={tutor.id} />
                          <DeleteTutorButton
                            tutorId={tutor.id}
                            name={tutor.user.name ?? "this tutor"}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {tutors.length === 0 && (
        <EmptyState
          illustration={<NoResultsScene />}
          title="No tutor applications yet"
          description="When tutors apply to join the platform, they'll appear here for verification."
          tone="default"
          size="lg"
        />
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "primary" | "success" | "warning";
  icon: React.ReactNode;
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="card-premium p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
