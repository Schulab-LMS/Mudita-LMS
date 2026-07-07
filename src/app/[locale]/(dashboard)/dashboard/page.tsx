import { redirect } from "@/i18n/navigation";
import { getViewContext } from "@/lib/view-as.server";
import type { Role } from "@/config/navigation";

const roleRedirectMap: Record<Role, string> = {
  STUDENT: "/student",
  PARENT: "/parent",
  TUTOR: "/tutor",
  ADMIN: "/admin",
  SUPER_ADMIN: "/admin",
  // B2B_PARTNER / ORG_ADMIN have no dedicated dashboard yet — land them on
  // /account (a neutral authenticated page) rather than /admin, which the admin
  // gate bounces (previously an infinite /dashboard ↔ /admin loop).
  B2B_PARTNER: "/account",
  ORG_ADMIN: "/account",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Route on the EFFECTIVE role so an admin previewing as a role lands on that
  // role's dashboard.
  const { session, effectiveRole } = await getViewContext();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  const target = effectiveRole ? roleRedirectMap[effectiveRole as Role] : undefined;
  redirect({ href: target ?? "/onboarding", locale });
}
