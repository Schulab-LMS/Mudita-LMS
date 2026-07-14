export const ADMIN_USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "ORG_ADMIN",
  "TUTOR",
  "PARENT",
  "STUDENT",
  "B2B_PARTNER",
] as const;

export interface AdminUserTableRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  enrollmentCount: number;
  hasComp: boolean;
  isSelf: boolean;
}

export type AdminUserStatusFilter = "" | "active" | "inactive";

export function filterAdminUsers(
  users: AdminUserTableRow[],
  filters: {
    query: string;
    role: string;
    status: AdminUserStatusFilter;
  }
): AdminUserTableRow[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return users.filter((user) => {
    if (
      query &&
      !user.name.toLocaleLowerCase().includes(query) &&
      !user.email.toLocaleLowerCase().includes(query)
    ) {
      return false;
    }
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status === "active" && !user.isActive) return false;
    if (filters.status === "inactive" && user.isActive) return false;
    return true;
  });
}
