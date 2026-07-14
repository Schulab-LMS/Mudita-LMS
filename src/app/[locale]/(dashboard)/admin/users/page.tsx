import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole, isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { compStatusFor } from "@/services/comp-access.service";
import { PageHeader } from "@/components/ui/page-header";
import { ADMIN_USER_ROLES } from "./user-filter";
import { UsersTable } from "./users-table";
import { ExportUsersButton } from "./export-users-button";

export async function generateMetadata() {
  const t = await getTranslations("admin.users");
  return { title: t("pageTitle") };
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

  // One query for comp state across the whole table (avoids N+1).
  const compUserIds = await compStatusFor(users.map((u) => u.id));

  // Aggregate role counts
  const roleCounts: Record<string, number> = {};
  let activeCount = 0;
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    if (u.isActive) activeCount++;
  }

  const roleLabels = Object.fromEntries(
    ADMIN_USER_ROLES.map((role) => [role, tRoles(role)])
  );
  const tableUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    enrollmentCount: user._count.enrollments,
    isSelf: user.id === session.user.id,
    hasComp: compUserIds.has(user.id),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("totalActive", {
          total: users.length,
          active: activeCount,
        })}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        actions={<ExportUsersButton users={tableUsers} />}
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
                {roleLabels[role] ?? role.replaceAll("_", " ")}
              </div>
            </div>
          ))}
      </div>

      <UsersTable
        users={tableUsers}
        locale={locale}
        roleLabels={roleLabels}
        canManageRoles={canManageRoles}
        labels={{
          user: t("user"),
          role: tCommon("role"),
          status: tCommon("status"),
          enrollments: t("enrollments"),
          joined: t("joined"),
          actions: tCommon("actions"),
          active: tCommon("active"),
          inactive: tCommon("inactive"),
          noUsersFound: t("noUsersFound"),
        }}
      />
    </div>
  );
}
