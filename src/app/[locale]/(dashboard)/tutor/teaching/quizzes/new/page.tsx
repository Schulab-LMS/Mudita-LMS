import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorAssignmentOptions } from "@/services/tutor-assignment.service";
import { PageHeader } from "@/components/ui/page-header";
import { ListChecks } from "lucide-react";
import { TutorQuizForm } from "./tutor-quiz-form";

export const metadata = { title: "New structured quiz" };

export default async function NewTutorQuizPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const options = await getTutorAssignmentOptions(session.user.id);
  if (!options) redirect("/tutor");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New structured quiz"
        description="Create automatically graded questions for one booked learner and an authorized course."
        breadcrumbs={[{ label: "Teaching", href: "/tutor/teaching" }, { label: "New quiz" }]}
        icon={<ListChecks className="h-5 w-5" />}
      />
      <TutorQuizForm learners={options.learners} />
    </div>
  );
}
