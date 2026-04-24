import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import CourseForm from "@/components/admin/course-form";
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen } from "lucide-react";

export const metadata = { title: "New Course | Admin" };

export default async function NewCoursePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New course"
        description="Create a new course for the platform."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: "New" },
        ]}
        icon={<BookOpen className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <CourseForm mode="create" />
      </div>
    </div>
  );
}
