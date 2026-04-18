import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChildren } from "@/services/user.service";
import { ChildCard } from "@/components/dashboard/child-card";
import { AddChildForm } from "./add-child-form";

export const metadata = { title: "Manage Children | Schulab" };

export default async function ParentChildrenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const children = await getChildren(session.user.id);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Manage Children</h1>
        <p className="text-muted-foreground">
          {children.length} child{children.length !== 1 ? "ren" : ""} linked to your account
        </p>
      </div>

      {children.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">👦</p>
          <p className="mt-3 text-lg font-medium">No children linked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the form below to add your first child account.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold">Add a Child Account</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Create a new account for your child and link it to your parent account.
        </p>
        <AddChildForm />
      </div>
    </div>
  );
}
