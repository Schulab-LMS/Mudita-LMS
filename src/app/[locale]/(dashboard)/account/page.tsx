import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AccountForms } from "./account-forms";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Calendar, Shield, Globe, BadgeCheck } from "lucide-react";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [locale, user] = await Promise.all([
    getLocale(),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        locale: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) redirect("/login");

  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const roleLabel =
    user.role.charAt(0) + user.role.slice(1).toLowerCase().replace("_", " ");
  const localeLabel =
    user.locale === "de"
      ? "Deutsch"
      : user.locale === "ar"
        ? "العربية"
        : "English";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Account"
        description="Manage your profile, password, and privacy. Changes here apply immediately."
        breadcrumbs={[{ label: "Account" }]}
      />

      {/* Profile hero summary */}
      <div className="card-premium relative overflow-hidden p-6">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-launch-gradient-horizontal"
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            src={user.avatar ?? undefined}
            fallback={getInitials(user.name || "U")}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-xl font-bold text-foreground">
                {user.name}
              </h2>
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-primary"
                aria-label="Verified"
              />
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="chip chip-primary">
                <Shield className="h-3 w-3" aria-hidden />
                {roleLabel}
              </span>
              <span className="chip chip-neutral">
                <Globe className="h-3 w-3" aria-hidden />
                {localeLabel}
              </span>
              <span className="chip chip-neutral">
                <Calendar className="h-3 w-3" aria-hidden />
                Joined {dateFmt.format(new Date(user.createdAt))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AccountForms
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          locale: user.locale,
          role: user.role,
          hasPassword: Boolean(user.passwordHash),
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
