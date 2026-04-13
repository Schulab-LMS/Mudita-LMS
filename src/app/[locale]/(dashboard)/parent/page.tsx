import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChildren } from "@/services/user.service";
import { ChildCard } from "@/components/dashboard/child-card";
import { Link } from "@/i18n/navigation";

export const metadata = { title: "Parent Dashboard | Mudita LMS" };

export default async function ParentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const children = await getChildren(session.user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          You have {children.length} child{children.length !== 1 ? "ren" : ""} linked to your account.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Children</h2>
        <Link
          href="/parent/children"
          className="inline-flex items-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Manage Children
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">👦</p>
          <p className="mt-3 text-lg font-medium">No children linked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your child&apos;s account to track their learning progress.
          </p>
          <Link
            href="/parent/children"
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Add a Child
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
