import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChildren } from "@/services/user.service";
import { ChildCard } from "@/components/dashboard/child-card";
import { AddChildForm } from "./add-child-form";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { UserPlus, Users } from "lucide-react";

export const metadata = { title: "Manage Children | Schulab" };

export default async function ParentChildrenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const children = await getChildren(session.user.id);

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
