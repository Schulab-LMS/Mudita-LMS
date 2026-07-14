import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen } from "lucide-react";
import { CourseAssignmentPanel } from "./course-assignment-panel";

export default async function TutorCoursesPage({ params }: { params: Promise<{ tutorId: string }> }) {
  const { tutorId } = await params;
  const [tutor, courses] = await Promise.all([
    db.tutorProfile.findUnique({
      where: { id: tutorId },
      select: {
        id: true,
        user: { select: { name: true, email: true } },
        courseAssignments: {
          orderBy: { course: { title: "asc" } },
          select: { course: { select: { id: true, title: true, status: true } } },
        },
      },
    }),
    db.course.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { title: "asc" },
      select: { id: true, title: true, status: true },
    }),
  ]);
  if (!tutor) notFound();

  const assigned = tutor.courseAssignments.map((item) => item.course);
  const assignedIds = new Set(assigned.map((course) => course.id));
  const available = courses.filter((course) => !assignedIds.has(course.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${tutor.user.name}'s courses`}
        description={`${tutor.user.email} · Manage durable teaching permissions.`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Tutors", href: "/admin/tutors" }, { label: "Courses" }]}
        icon={<BookOpen className="h-5 w-5" />}
      />
      <CourseAssignmentPanel tutorId={tutor.id} assigned={assigned} available={available} />
    </div>
  );
}
