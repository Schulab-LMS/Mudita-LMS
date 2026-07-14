import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorAssignmentOptions } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { ClipboardPlus } from "lucide-react";
import { AssignmentForm } from "./assignment-form";

export const metadata = { title: "New assignment" };

export default async function NewTutorAssignmentPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const options = await getTutorAssignmentOptions(session.user.id);
  if (!options) redirect("/tutor/profile");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New assignment"
        description="Set a task for a booked learner in one of their enrolled courses."
        breadcrumbs={[{ label: "Teaching", href: "/tutor/teaching" }, { label: "New assignment" }]}
        icon={<ClipboardPlus className="h-5 w-5" />}
      />
      {options.learners.length === 0 ? (
        <div className="card-premium p-6 text-sm text-muted-foreground">A learner must book you before you can assign work.</div>
      ) : (
        <AssignmentForm learners={options.learners} />
      )}
    </div>
  );
}
