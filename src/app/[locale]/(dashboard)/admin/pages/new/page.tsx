import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { PageForm } from "../page-form";

export const metadata = { title: "New Page | Admin | Schulab" };

export default async function NewPagePage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Create New Page</h1>
      <PageForm mode="create" />
    </div>
  );
}
