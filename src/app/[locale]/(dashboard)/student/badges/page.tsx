import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserBadges, getAllBadges } from "@/services/gamification.service";
import { BadgeDisplay } from "@/components/gamification/badge-display";

export const metadata = { title: "My Badges | Schulab" };

export default async function StudentBadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [userBadges, allBadges] = await Promise.all([
    getUserBadges(session.user.id),
    getAllBadges(),
  ]);

  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
  const earnedMap = new Map(userBadges.map((ub) => [ub.badgeId, ub]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Badges</h1>
        <p className="text-muted-foreground">
          {userBadges.length} of {allBadges.length} badges earned
        </p>
      </div>

      {allBadges.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-4xl">🏅</p>
          <p className="mt-2 font-medium">No badges available yet</p>
          <p className="text-sm text-muted-foreground">Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allBadges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            const userBadge = earnedMap.get(badge.id);
            return (
              <BadgeDisplay
                key={badge.id}
                badge={badge}
                earned={earned}
                earnedAt={userBadge?.earnedAt}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
