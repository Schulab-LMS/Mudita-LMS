import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import type { Role } from "@/config/navigation";

const roleRedirectMap: Record<Role, string> = {
  STUDENT: "/student",
  PARENT: "/parent",
  TUTOR: "/tutor",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
  B2B_PARTNER: "/admin",
};

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const role = (session.user as { role?: Role }).role;
  const target = (role && roleRedirectMap[role]) ?? "/student";
  redirect({ href: target, locale });
}
