import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { HelpArticleForm } from "../help-article-form";

export const metadata = { title: "New Help Article | Admin | Schulab" };

export default async function NewHelpArticlePage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">New Help Article</h1>
        <p className="text-muted-foreground">
          Create a new article for the Help Center.
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <HelpArticleForm mode="create" />
      </div>
    </div>
  );
}
