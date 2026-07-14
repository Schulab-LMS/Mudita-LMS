import type { AdminUserTableRow } from "./user-filter";

type ExportableUser = Pick<
  AdminUserTableRow,
  | "name"
  | "email"
  | "role"
  | "isActive"
  | "enrollmentCount"
  | "createdAt"
>;

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function usersToCsv(users: ExportableUser[]): string {
  const rows = users.map((user) => [
    user.name,
    user.email,
    user.role,
    user.isActive ? "Active" : "Inactive",
    user.enrollmentCount,
    user.createdAt,
  ]);

  return [
    ["Name", "Email", "Role", "Status", "Enrollments", "Joined"],
    ...rows,
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
