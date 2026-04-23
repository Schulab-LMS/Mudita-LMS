import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { BadgeDisplay } from "@/components/gamification/badge-display";
import { createBadge } from "@/actions/admin.actions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { Award, Sparkles, Plus } from "lucide-react";

export const metadata = { title: "Manage Badges | Admin" };

export default async function AdminBadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const badges = await db.badge
    .findMany({ orderBy: { name: "asc" } })
    .catch(() => []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Badges"
        description={`${badges.length} badge${
          badges.length === 1 ? "" : "s"
        } configured across the platform`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Badges" },
        ]}
      />

      {/* Badges gallery */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            Badge gallery
          </h2>
          <span className="chip chip-primary">{badges.length}</span>
        </div>

        {badges.length === 0 ? (
          <EmptyState
            illustration={<NoCoursesScene />}
            title="No badges yet"
            description="Create your first badge below — students will earn it as soon as they meet the criteria."
            tone="first-use"
            size="md"
          />
        ) : (
          <div className="card-premium p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {badges.map((badge) => (
                <BadgeDisplay key={badge.id} badge={badge} earned={true} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Create new badge form */}
      <section className="card-premium max-w-2xl p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Create new badge
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Define a new achievement — students earn it automatically when
              they hit the criteria.
            </p>
          </div>
        </div>

        <form
          action={async (fd: FormData) => {
            "use server";
            const name = fd.get("name") as string;
            const description = fd.get("description") as string;
            const icon = fd.get("icon") as string;
            const minPoints = fd.get("minPoints") as string;
            const minEnrollments = fd.get("minEnrollments") as string;
            const points = parseInt(fd.get("points") as string) || 0;

            const criteria: Record<string, unknown> = {};
            if (minPoints) criteria.minPoints = parseInt(minPoints);
            if (minEnrollments)
              criteria.minEnrollments = parseInt(minEnrollments);

            await createBadge({ name, description, icon, criteria, points });
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="badge-name"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Name *
              </label>
              <input
                id="badge-name"
                name="name"
                required
                placeholder="First Steps"
                className="input-pretty flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="badge-icon"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Icon (emoji) *
              </label>
              <input
                id="badge-icon"
                name="icon"
                required
                placeholder="🏅"
                maxLength={4}
                className="input-pretty flex h-10 w-24 rounded-lg border border-input bg-background px-3 py-2 text-center text-lg placeholder:text-muted-foreground focus-visible:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="badge-desc"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Description *
            </label>
            <input
              id="badge-desc"
              name="description"
              required
              placeholder="Complete your first course"
              className="input-pretty flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="badge-minpts"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Min points
              </label>
              <input
                id="badge-minpts"
                name="minPoints"
                type="number"
                min="0"
                placeholder="100"
                className="input-pretty flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Criteria threshold
              </p>
            </div>
            <div>
              <label
                htmlFor="badge-minenr"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Min enrollments
              </label>
              <input
                id="badge-minenr"
                name="minEnrollments"
                type="number"
                min="0"
                placeholder="1"
                className="input-pretty flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Criteria threshold
              </p>
            </div>
            <div>
              <label
                htmlFor="badge-points"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Points awarded
              </label>
              <input
                id="badge-points"
                name="points"
                type="number"
                min="0"
                placeholder="50"
                defaultValue="0"
                className="input-pretty flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                On earning this badge
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg bg-launch-gradient px-5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create badge
              <Award className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
