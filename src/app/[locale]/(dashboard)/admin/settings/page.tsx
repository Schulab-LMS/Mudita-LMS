import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole, isSuperAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { SettingsForm } from "./settings-form";
import { AddSettingForm } from "./add-setting-form";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  Settings as SettingsIcon,
  Mail,
  CreditCard,
  Palette,
  Bell,
  Lock,
  Plus,
} from "lucide-react";

export const metadata = { title: "System Settings | Admin" };

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  email: "Email",
  payments: "Payments",
  branding: "Branding",
  notifications: "Notifications",
};

const CATEGORY_ICONS: Record<string, typeof SettingsIcon> = {
  general: SettingsIcon,
  email: Mail,
  payments: CreditCard,
  branding: Palette,
  notifications: Bell,
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const canEdit = isSuperAdmin(session.user.role);

  const settings = await db.systemSetting
    .findMany({
      orderBy: [{ category: "asc" }, { key: "asc" }],
    })
    .catch(() => []);

  // Group by category
  type Setting = {
    id: string;
    key: string;
    value: string;
    type: string;
    category: string;
    label: string;
    description: string | null;
    updatedAt: Date;
  };
  const grouped: Record<string, Setting[]> = {};
  for (const s of settings) {
    const cat = s.category || "general";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }

  const categories = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description={`${settings.length} setting${
          settings.length === 1 ? "" : "s"
        } across ${categories.length} ${
          categories.length === 1 ? "category" : "categories"
        }`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Settings" },
        ]}
        actions={
          !canEdit ? (
            <span className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-input bg-muted/40 px-3 text-xs font-semibold text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Read-only
            </span>
          ) : undefined
        }
      />

      {settings.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No settings defined yet"
          description={
            canEdit
              ? "Add settings below or run the seed script to populate the defaults."
              : "Ask a Super Admin to configure system settings."
          }
          tone="default"
          size="lg"
        />
      ) : (
        <div className="space-y-5">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] ?? SettingsIcon;
            const label =
              CATEGORY_LABELS[category] ||
              category.charAt(0).toUpperCase() + category.slice(1);
            return (
              <section key={category} className="card-premium overflow-hidden">
                <header className="flex items-center gap-3 border-b border-border px-6 py-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-foreground">
                      {label}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {grouped[category].length} setting
                      {grouped[category].length === 1 ? "" : "s"}
                    </p>
                  </div>
                </header>
                <div className="p-6">
                  <SettingsForm
                    settings={grouped[category]}
                    canEdit={canEdit}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}

      {canEdit && (
        <div className="card-premium max-w-2xl p-6">
          <div className="mb-4 flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Plus className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Add setting
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Define a new configurable value. Super Admin only.
              </p>
            </div>
          </div>
          <AddSettingForm />
        </div>
      )}
    </div>
  );
}
