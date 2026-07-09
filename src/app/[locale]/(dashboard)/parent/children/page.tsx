import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getChildren } from "@/services/user.service";
import { isMinor } from "@/lib/compliance";
import { ChildCard } from "@/components/dashboard/child-card";
import { AddChildForm } from "./add-child-form";
import { BulkConsentBanner } from "./bulk-consent-banner";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { UserPlus, Users } from "lucide-react";

export const metadata = { title: "Manage Children" };

export default async function ParentChildrenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const children = await getChildren(session.user.id);

  // Count children who are minors AND don't have an active parental
  // consent on file. The bulk-consent banner only renders when 2+ qualify
  // — for a single child the per-child panel is the right surface.
  let unconsentedMinorCount = 0;
  if (children.length > 1) {
    const childIds = children.map((c) => c.id);
    const consentByChild = await db.consentRecord.findMany({
      where: {
        userId: { in: childIds },
        type: { in: ["PARENTAL_COPPA", "PARENTAL_GDPR_K"] },
      },
      orderBy: { grantedAt: "desc" },
      select: { userId: true, granted: true },
    });
    const latestGrantPerChild = new Map<string, boolean>();
    for (const r of consentByChild) {
      if (!latestGrantPerChild.has(r.userId)) {
        latestGrantPerChild.set(r.userId, r.granted);
      }
    }
    unconsentedMinorCount = children.filter((c) => {
      if (!c.dateOfBirth || !isMinor(c.dateOfBirth)) return false;
      return !latestGrantPerChild.get(c.id);
    }).length;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage children"
        description={`${children.length} child${
          children.length === 1 ? "" : "ren"
        } linked to your account`}
        breadcrumbs={[
          { label: "Parent", href: "/parent" },
          { label: "Children" },
        ]}
        icon={<Users className="h-5 w-5" />}
      />

      {unconsentedMinorCount >= 2 && (
        <BulkConsentBanner
          unconsentedCount={unconsentedMinorCount}
          defaultType="PARENTAL_GDPR_K"
        />
      )}

      {children.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No children linked yet"
          description="Add your first child below — they'll get their own login, progress tracking, and badges, all connected to your parent dashboard."
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}

      {/* Add-child form card */}
      <div className="card-premium p-6">
        <div className="mb-5 flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <UserPlus className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Add a child account
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Create a new account for your child and link it to your parent
              account.
            </p>
          </div>
        </div>
        <AddChildForm />
      </div>
    </div>
  );
}
