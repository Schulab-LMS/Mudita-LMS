import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { BadgeDisplay } from "@/components/gamification/badge-display";
import { createBadge } from "@/actions/admin.actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.badges");
  return { title: `${t("pageTitle")} | Schulab` };
}

export default async function AdminBadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const t = await getTranslations("admin.badges");

  const badges = await db.badge.findMany({ orderBy: { name: "asc" } }).catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("badgeCount", { count: badges.length })}</p>
      </div>

      {badges.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {badges.map((badge) => (
            <BadgeDisplay
              key={badge.id}
              badge={badge}
              earned={true}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 max-w-lg">
        <h2 className="mb-1 text-lg font-semibold">{t("createHeading")}</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          {t("createDescription")}
        </p>
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
            if (minEnrollments) criteria.minEnrollments = parseInt(minEnrollments);

            await createBadge({ name, description, icon, criteria, points });
          }}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("nameLabel")} *</label>
            <input
              name="name"
              required
              placeholder={t("namePlaceholder")}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("descriptionLabel")} *</label>
            <input
              name="description"
              required
              placeholder={t("descriptionPlaceholder")}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("iconLabel")} *</label>
            <input
              name="icon"
              required
              placeholder={t("iconPlaceholder")}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("minPointsLabel")}
              </label>
              <input
                name="minPoints"
                type="number"
                min="0"
                placeholder="100"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                {t("minEnrollmentsLabel")}
              </label>
              <input
                name="minEnrollments"
                type="number"
                min="0"
                placeholder="1"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("pointsAwardedLabel")}
            </label>
            <input
              name="points"
              type="number"
              min="0"
              placeholder="50"
              defaultValue="0"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            {t("createButton")}
          </button>
        </form>
      </div>
    </div>
  );
}
