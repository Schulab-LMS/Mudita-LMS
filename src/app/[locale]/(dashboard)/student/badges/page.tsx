import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBadges, getAllBadges } from "@/services/gamification.service";
import { BadgeDisplay } from "@/components/gamification/badge-display";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { Award, Trophy, Lock } from "lucide-react";

export const metadata = { title: "My Badges" };

export default async function StudentBadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [userBadges, allBadges] = await Promise.all([
    getUserBadges(session.user.id),
    getAllBadges(),
  ]);

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
  const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));
  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;
  const pct =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const earned = allBadges.filter((b) => earnedBadgeIds.has(b.id));
  const locked = allBadges.filter((b) => !earnedBadgeIds.has(b.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Badges"
        description={`${earnedCount} of ${totalCount} badges earned · ${pct}% complete`}
        breadcrumbs={[{ label: "Badges" }]}
        icon={<Award className="h-5 w-5" />}
      />

      {/* Progress summary */}
      {totalCount > 0 && (
        <div className="card-premium p-5">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Trophy className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your progress
              </p>
              <p className="font-display text-xl font-bold text-foreground">
                {earnedCount} badge{earnedCount === 1 ? "" : "s"} earned
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-foreground">
                {pct}%
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                complete
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-launch-gradient-horizontal transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {allBadges.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No badges available yet"
          description="Our team is cooking up new achievements — check back soon!"
          tone="default"
          size="lg"
        />
      ) : (
        <>
          {/* Earned badges */}
          {earned.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Earned
                </h2>
                <span className="chip chip-success">
                  <Trophy className="h-3 w-3" aria-hidden />
                  {earned.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {earned.map((badge) => {
                  const userBadge = earnedMap.get(badge.id);
                  return (
                    <BadgeDisplay
                      key={badge.id}
                      badge={badge}
                      earned
                      earnedAt={userBadge?.earnedAt}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Locked badges */}
          {locked.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Still to earn
                </h2>
                <span className="chip chip-neutral">
                  <Lock className="h-3 w-3" aria-hidden />
                  {locked.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {locked.map((badge) => (
                  <BadgeDisplay
                    key={badge.id}
                    badge={badge}
                    earned={false}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
