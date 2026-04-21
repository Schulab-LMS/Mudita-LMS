import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole, isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { UserActions } from "./user-actions";

export async function generateMetadata() {
  const t = await getTranslations("admin.users");
  return { title: t("pageTitle") };
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN: "bg-blue-100 text-blue-800",
  TUTOR: "bg-orange-100 text-orange-800",
  PARENT: "bg-teal-100 text-teal-800",
  STUDENT: "bg-primary/10 text-primary",
  B2B_PARTNER: "bg-pink-100 text-pink-800",
};
const KNOWN_ROLES = new Set(Object.keys(ROLE_COLORS));

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

  // Stats
  const roleCounts: Record<string, number> = {};
  let activeCount = 0;
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
    if (u.isActive) activeCount++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("totalActive", { total: users.length, active: activeCount })}
        </p>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(roleCounts)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([role, count]) => (
            <div key={role} className="rounded-lg border bg-white p-3 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground">
                {KNOWN_ROLES.has(role) ? tRoles(role) : role.replace("_", " ")}
              </div>
            </div>
          ))}
      </div>

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("user")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{tCommon("role")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{tCommon("status")}</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">{t("enrollments")}</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("joined")}</th>
              <th className="px-4 py-3 text-end font-medium text-muted-foreground">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  {t("noUsersFound")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-800"}`}>
                      {KNOWN_ROLES.has(user.role) ? tRoles(user.role) : user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? tCommon("active") : tCommon("inactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {user._count.enrollments}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dateFormatter.format(new Date(user.createdAt))}
                  </td>
                  <td className="px-4 py-3">
                    <UserActions
                      userId={user.id}
                      currentRole={user.role}
                      isActive={user.isActive}
                      canManageRoles={canManageRoles}
                      isSelf={user.id === session.user.id}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
