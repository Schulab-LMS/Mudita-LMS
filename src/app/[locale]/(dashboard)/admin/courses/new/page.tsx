import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import CourseForm from "@/components/admin/course-form";

export const metadata = { title: "New Course | Admin" };

export default async function NewCoursePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">New Course</h1>
        <p className="text-muted-foreground">Create a new course for the platform.</p>
      </div>
      <CourseForm mode="create" />
    </div>
  );
}
