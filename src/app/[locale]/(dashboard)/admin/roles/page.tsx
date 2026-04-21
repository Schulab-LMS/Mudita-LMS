import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole, isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { RolePermissionMatrix } from "./role-permission-matrix";
import { AddPermissionForm } from "./add-permission-form";

export async function generateMetadata() {
  const t = await getTranslations("admin.rolesPage");
  return { title: `${t("pageTitle")} | Schulab` };
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "TUTOR", "PARENT", "STUDENT", "B2B_PARTNER"] as const;

export default async function AdminRolesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const canEdit = isSuperAdmin(session.user.role);
  const t = await getTranslations("admin.rolesPage");

  const [permissions, rolePermissions] = await Promise.all([
    db.permission.findMany({ orderBy: [{ resource: "asc" }, { action: "asc" }] }).catch(() => []),
    db.rolePermission.findMany().catch(() => []),
  ]);

  const matrix: Record<string, string[]> = {};
  for (const role of ROLES) matrix[role] = [];
  for (const rp of rolePermissions) {
    if (!matrix[rp.role]) matrix[rp.role] = [];
    matrix[rp.role].push(rp.permissionId);
  }

  type Perm = { id: string; name: string; description: string; resource: string; action: string };
  const grouped: Record<string, Perm[]> = {};
  for (const p of permissions) {
    if (!grouped[p.resource]) grouped[p.resource] = [];
    grouped[p.resource].push(p);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">
            {t("subtitleCounts", {
              permissions: permissions.length,
              resources: Object.keys(grouped).length,
            })}
          </p>
        </div>
      </div>

      {permissions.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-muted-foreground">
            {canEdit ? t("emptyEditable") : t("emptyReadOnly")}
          </p>
        </div>
      ) : (
        <RolePermissionMatrix
          roles={ROLES as unknown as string[]}
          grouped={grouped}
          matrix={matrix}
          canEdit={canEdit}
        />
      )}

      {canEdit && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("addHeading")}</h2>
          <AddPermissionForm />
        </div>
      )}
    </div>
  );
}
