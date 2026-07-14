"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResultsScene } from "@/components/illustrations/empty-scenes";
import { UserActions } from "./user-actions";
import {
  ADMIN_USER_ROLES,
  filterAdminUsers,
  type AdminUserStatusFilter,
  type AdminUserTableRow,
} from "./user-filter";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:
    "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25",
  ADMIN: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25",
  ORG_ADMIN:
    "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
  TUTOR:
    "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/25",
  PARENT:
    "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/25",
  STUDENT: "bg-primary/15 text-primary border-primary/25",
  B2B_PARTNER:
    "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/25",
};

interface Labels {
  user: string;
  role: string;
  status: string;
  enrollments: string;
  joined: string;
  actions: string;
  active: string;
  inactive: string;
  noUsersFound: string;
}

interface UsersTableProps {
  users: AdminUserTableRow[];
  locale: string;
  roleLabels: Record<string, string>;
  labels: Labels;
  canManageRoles: boolean;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UsersTable({
  users,
  locale,
  roleLabels,
  labels,
  canManageRoles,
}: UsersTableProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<AdminUserStatusFilter>("");

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, { query, role, status }),
    [query, role, status, users]
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale]
  );
  const availableRoles = useMemo(() => {
    const present = new Set(users.map((user) => user.role));
    return [
      ...ADMIN_USER_ROLES.filter((value) => present.has(value)),
      ...Array.from(present)
        .filter(
          (value) =>
            !ADMIN_USER_ROLES.includes(
              value as (typeof ADMIN_USER_ROLES)[number]
            )
        )
        .sort(),
    ];
  }, [users]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search by name or email"
            className="input-pretty h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm focus-visible:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Filter by role"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All roles</option>
          {availableRoles.map((value) => (
            <option key={value} value={value}>
              {roleLabels[value] ?? value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as AdminUserStatusFilter)
          }
          aria-label="Filter by status"
          className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">{labels.active}</option>
          <option value="inactive">{labels.inactive}</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          illustration={<NoResultsScene />}
          title={labels.noUsersFound}
          description="No users match the current filters. Try a different search or clear a filter."
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
                    {labels.user}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.role}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.status}
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.enrollments}
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.joined}
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {labels.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
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
                        {roleLabels[user.role] ?? user.role.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {labels.active}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          {labels.inactive}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                        {user.enrollmentCount}
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
                        isSelf={user.isSelf}
                        hasComp={user.hasComp}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {users.length}
              </span>
            </span>
          </div>
        </div>
      )}
    </>
  );
}
