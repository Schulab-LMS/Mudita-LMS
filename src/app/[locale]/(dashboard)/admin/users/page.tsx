import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole, isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { UserActions } from "./user-actions";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResultsScene } from "@/components/illustrations/empty-scenes";
import { Search, UserPlus, Download } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("admin.users");
  return { title: t("pageTitle") };
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:
    "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25",
  ADMIN: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25",
  TUTOR:
    "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/25",
  PARENT:
    "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/25",
  STUDENT: "bg-primary/15 text-primary border-primary/25",
  B2B_PARTNER:
    "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/25",
};
const KNOWN_ROLES = new Set(Object.keys(ROLE_COLORS));

// Avatar initials — kept out of render to satisfy React Compiler purity.
function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const canManageRoles = isSuperAdmin(session.user.role);

  const [t, tCommon, tRoles, locale, users] = await Promise.all([
    getTranslations("admin.users"),
    getTranslations("admin.common"),
    getTranslations("admin.roles"),
    getLocale(),
    db.user
      .findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          locale: true,
          createdAt: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => []),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Aggregate role counts
  const roleCounts: Record<string, number> = {};
  let activeCount = 0;
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    if (u.isActive) activeCount++;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("totalActive", {
          total: users.length,
          active: activeCount,
        })}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Export CSV
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              Invite user
            </button>
          </>
        }
      />

      {/* Role summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(roleCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([role, count]) => (
            <div
              key={role}
              className="card-premium p-4 text-center"
            >
              <div className="font-display text-2xl font-bold text-foreground">
                {count}
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {KNOWN_ROLES.has(role)
                  ? tRoles(role)
                  : role.replace("_", " ")}
              </div>
            </div>
          ))}
      </div>

      {/* Search / filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search by name or email…"
            className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
          />
        </div>
        <select
          aria-label="Filter by role"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All roles</option>
          {Object.keys(ROLE_COLORS).map((r) => (
            <option key={r} value={r}>
              {tRoles(r)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">{tCommon("active")}</option>
          <option value="inactive">{tCommon("inactive")}</option>
        </select>
      </div>

      {/* Users table */}
      {users.length === 0 ? (
        <EmptyState
          illustration={<NoResultsScene />}
          title={t("noUsersFound")}
          description="No users match the current filters. Invite your first admin or try clearing filters."
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
                    {t("user")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("role")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("status")}
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("enrollments")}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("joined")}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {tCommon("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                          {initialsOf(user.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          ROLE_COLORS[user.role] ??
                          "border-muted bg-muted text-muted-foreground"
                        }`}
                      >
                        {KNOWN_ROLES.has(user.role)
                          ? tRoles(user.role)
                          : user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {tCommon("active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          {tCommon("inactive")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                        {user._count.enrollments}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(user.createdAt))}
                    </td>
                    <td className="px-5 py-3">
                      <UserActions
                        userId={user.id}
                        currentRole={user.role}
                        isActive={user.isActive}
                        canManageRoles={canManageRoles}
                        isSelf={user.id === session.user.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer / pagination placeholder */}
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-semibold text-foreground">{users.length}</span> of{" "}
              <span className="font-semibold text-foreground">{users.length}</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled
                className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled
                className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2 text-xs font-medium disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
