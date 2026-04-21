import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getChildren } from "@/services/user.service";
import { ChildCard } from "@/components/dashboard/child-card";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "Parent Dashboard | Schulab" };

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const [t, children] = await Promise.all([
    getTranslations("parentDashboard"),
    getChildren(session.user.id),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {t("welcomeBack", { name: firstName })}
        </h1>
        <p className="text-muted-foreground">
          {t("childrenLinked", { count: children.length })}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("yourChildren")}</h2>
        <Link
          href="/parent/children"
          className="inline-flex items-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          {t("manageChildren")}
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">👦</p>
          <p className="mt-3 text-lg font-medium">{t("noChildrenTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("noChildrenBody")}
          </p>
          <Link
            href="/parent/children"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            {t("addChildCta")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
