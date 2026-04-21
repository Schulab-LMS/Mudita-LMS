"use client";

import { Fragment, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { bulkUpdateRolePermissions } from "@/actions/role.actions";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Props {
  roles: string[];
  grouped: Record<string, Permission[]>;
  matrix: Record<string, string[]>;
  canEdit: boolean;
}

const KNOWN_ROLES = new Set([
  "STUDENT",
  "PARENT",
  "TUTOR",
  "ADMIN",
  "SUPER_ADMIN",
  "B2B_PARTNER",
]);

export function RolePermissionMatrix({ roles, grouped, matrix, canEdit }: Props) {
  const tPage = useTranslations("admin.rolesPage");
  const tCommon = useTranslations("admin.common");
  const tRoles = useTranslations("admin.roles");
  const [localMatrix, setLocalMatrix] = useState(matrix);
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState<string | null>(null);

  function toggle(role: string, permId: string) {
    if (!canEdit) return;
    setLocalMatrix((prev) => {
      const current = prev[role] ?? [];
      const has = current.includes(permId);
      return {
        ...prev,
        [role]: has ? current.filter((id) => id !== permId) : [...current, permId],
      };
    });
  }

  function saveRole(role: string) {
    setSaving(role);
    startTransition(async () => {
      const result = await bulkUpdateRolePermissions(
        role as Parameters<typeof bulkUpdateRolePermissions>[0],
        localMatrix[role] ?? []
      );
      setSaving(null);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
    });
  }

  const resources = Object.keys(grouped).sort();

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="sticky start-0 z-10 bg-muted/50 px-4 py-3 text-start font-medium">
              {tPage("permissionCol")}
            </th>
            {roles.map((role) => (
              <th key={role} className="px-3 py-3 text-center font-medium whitespace-nowrap">
                <div>{KNOWN_ROLES.has(role) ? tRoles(role) : role.replace("_", " ")}</div>
                {canEdit && (
                  <button
                    onClick={() => saveRole(role)}
                    disabled={pending}
                    className="mt-1 rounded bg-primary px-2 py-0.5 text-xs text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving === role ? tCommon("saving") : tCommon("save")}
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => (
            <Fragment key={resource}>
              <tr className="bg-muted/30">
                <td
                  colSpan={roles.length + 1}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {resource}
                </td>
              </tr>
              {grouped[resource].map((perm) => (
                <tr key={perm.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="sticky start-0 z-10 bg-white px-4 py-2">
                    <div className="font-medium">{perm.action}</div>
                    <div className="text-xs text-muted-foreground">{perm.description}</div>
                  </td>
                  {roles.map((role) => {
                    const checked = (localMatrix[role] ?? []).includes(perm.id);
                    return (
                      <td key={role} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(role, perm.id)}
                          disabled={!canEdit || pending}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
