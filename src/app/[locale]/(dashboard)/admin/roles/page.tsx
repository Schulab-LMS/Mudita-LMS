import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { RolePermissionMatrix } from "./role-permission-matrix";
import { AddPermissionForm } from "./add-permission-form";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { Lock, ShieldCheck, Layers, Plus } from "lucide-react";

export const metadata = { title: "Roles & Permissions | Admin" };

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "TUTOR",
  "PARENT",
  "STUDENT",
  "B2B_PARTNER",
] as const;

export default async function AdminRolesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const canEdit = isSuperAdmin(session.user.role);

  const [permissions, rolePermissions] = await Promise.all([
    db.permission
      .findMany({ orderBy: [{ resource: "asc" }, { action: "asc" }] })
      .catch(() => []),
    db.rolePermission.findMany().catch(() => []),
  ]);

  // Build matrix
  const matrix: Record<string, string[]> = {};
  for (const role of ROLES) matrix[role] = [];
  for (const rp of rolePermissions) {
    if (!matrix[rp.role]) matrix[rp.role] = [];
    matrix[rp.role].push(rp.permissionId);
  }

  // Group permissions by resource
  type Perm = {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
  };
  const grouped: Record<string, Perm[]> = {};
  for (const p of permissions) {
    if (!grouped[p.resource]) grouped[p.resource] = [];
    grouped[p.resource].push(p);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description={`${permissions.length} permission${
          permissions.length === 1 ? "" : "s"
        } across ${Object.keys(grouped).length} resource${
          Object.keys(grouped).length === 1 ? "" : "s"
        } · ${ROLES.length} roles`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Roles" },
        ]}
        actions={
          !canEdit ? (
            <span className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-muted/40 px-3 text-xs font-semibold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Read-only
            </span>
          ) : undefined
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile
          label="Roles"
          value={ROLES.length}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="primary"
        />
        <SummaryTile
          label="Permissions"
          value={permissions.length}
          icon={<Lock className="h-4 w-4" />}
          tone="secondary"
        />
        <SummaryTile
          label="Resources"
          value={Object.keys(grouped).length}
          icon={<Layers className="h-4 w-4" />}
          tone="accent"
        />
      </div>

      {permissions.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No permissions defined yet"
          description={
            canEdit
              ? "Add permissions below or run the seed script to populate the defaults."
              : "Ask a Super Admin to set up permissions."
          }
          tone="default"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">
              Permission matrix
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Grant or revoke permissions per role.{" "}
              {!canEdit && "You need Super Admin to make changes."}
            </p>
          </div>
          <div className="p-5">
            <RolePermissionMatrix
              roles={ROLES as unknown as string[]}
              grouped={grouped}
              matrix={matrix}
              canEdit={canEdit}
            />
          </div>
        </div>
      )}

      {canEdit && (
        <div className="card-premium max-w-2xl p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Add permission
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Define a new permission (resource + action). Super Admin only.
              </p>
            </div>
          </div>
          <AddPermissionForm />
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "primary" | "secondary" | "accent";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
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
