import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect({ href: "/login", locale });
  }

  return <>{children}</>;
}
