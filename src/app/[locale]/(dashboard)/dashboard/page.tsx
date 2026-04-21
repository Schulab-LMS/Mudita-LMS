import { redirect } from "@/i18n/navigation";
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

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const role = (session!.user as { role?: Role }).role;
  const target = role ? roleRedirectMap[role] : undefined;
  redirect({ href: target ?? "/onboarding", locale });
}
