"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  updateUserRole,
  toggleUserActive,
  grantCompAccess,
  revokeCompAccess,
} from "@/actions/admin.actions";

const ROLE_VALUES = [
  "STUDENT",
  "PARENT",
  "TUTOR",
  "ADMIN",
  "SUPER_ADMIN",
  "B2B_PARTNER",
] as const;

interface Props {
  userId: string;
  currentRole: string;
  isActive: boolean;
  canManageRoles: boolean;
  isSelf: boolean;
  hasComp: boolean;
}

export function UserActions({ userId, currentRole, isActive, canManageRoles, isSelf, hasComp }: Props) {
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("admin.common");
  const tRoles = useTranslations("admin.roles");
  const [pending, startTransition] = useTransition();
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  function handleToggleActive() {
    startTransition(async () => {
      const result = await toggleUserActive(userId);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
    });
  }

  function handleToggleComp() {
    if (hasComp && !confirm(t("compRevokeConfirm"))) return;
    startTransition(async () => {
      const result = hasComp
        ? await revokeCompAccess(userId)
        : await grantCompAccess(userId);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
    });
  }

  function handleRoleChange(newRole: string) {
    if (newRole === currentRole) {
      setShowRoleSelect(false);
      return;
    }
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) alert(result.error ?? tCommon("genericError"));
      setShowRoleSelect(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Role change */}
      {canManageRoles && !isSelf && (
        showRoleSelect ? (
          <select
            defaultValue={currentRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            onBlur={() => setShowRoleSelect(false)}
            autoFocus
            disabled={pending}
            className="rounded border px-2 py-1 text-xs disabled:opacity-50"
          >
            {ROLE_VALUES.map((value) => (
              <option key={value} value={value}>
                {tRoles(value)}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setShowRoleSelect(true)}
            disabled={pending}
            className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {t("changeRole")}
          </button>
        )
      )}

      {/* Grant / revoke complimentary access (payments-off beta) */}
      <button
        onClick={handleToggleComp}
        disabled={pending}
        title={hasComp ? t("compRevokeHint") : t("compGrantHint")}
        className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${
          hasComp
            ? "text-amber-700 hover:bg-amber-50"
            : "text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {pending ? "..." : hasComp ? t("compRevoke") : t("compGrant")}
      </button>

      {/* Toggle active/inactive */}
      {!isSelf && (
        <button
          onClick={handleToggleActive}
          disabled={pending}
          className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${
            isActive
              ? "text-red-600 hover:bg-red-50"
              : "text-green-700 hover:bg-green-50"
          }`}
        >
          {pending ? "..." : isActive ? t("deactivate") : t("activate")}
        </button>
      )}

      {isSelf && (
        <span className="text-xs text-muted-foreground italic">{t("you")}</span>
      )}
    </div>
  );
}
