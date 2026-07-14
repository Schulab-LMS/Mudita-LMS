"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { assignTutorCourse, unassignTutorCourse } from "@/actions/tutor-course.actions";

type Course = { id: string; title: string; status: string };

export function CourseAssignmentPanel({
  tutorId,
  assigned,
  available,
}: {
  tutorId: string;
  assigned: Course[];
  available: Course[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [courseId, setCourseId] = useState(available[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);

  function addCourse() {
    if (!courseId) return;
    setMessage(null);
    startTransition(async () => {
      const result = await assignTutorCourse({ tutorId, courseId });
      setMessage(result.success ? "Course assigned." : result.error ?? "Could not assign course");
      if (result.success) router.refresh();
    });
  }

  function removeCourse(removeCourseId: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await unassignTutorCourse({ tutorId, courseId: removeCourseId });
      setMessage(result.success ? "Course assignment removed." : result.error ?? "Could not remove course");
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="card-premium space-y-4 p-5">
        <div>
          <h2 className="font-semibold">Assign a course</h2>
          <p className="text-xs text-muted-foreground">This permission controls which enrolled curriculum the tutor may teach or assign.</p>
        </div>
        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">Every active course is already assigned.</p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="input-pretty min-w-0 flex-1" aria-label="Course to assign">
              {available.map((course) => <option key={course.id} value={course.id}>{course.title} ({course.status.toLowerCase()})</option>)}
            </select>
            <button type="button" onClick={addCourse} disabled={pending || !courseId} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              Assign course
            </button>
          </div>
        )}
        {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
      </section>

      <section className="card-premium overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="font-semibold">Assigned courses</h2>
          <p className="text-xs text-muted-foreground">{assigned.length} course{assigned.length === 1 ? "" : "s"}</p>
        </div>
        {assigned.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No teaching courses assigned.</p>
        ) : (
          <ul className="divide-y divide-border">
            {assigned.map((course) => (
              <li key={course.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.status.toLowerCase()}</p>
                </div>
                <button type="button" onClick={() => removeCourse(course.id)} disabled={pending} className="h-8 rounded-lg border border-destructive/30 px-3 text-xs font-semibold text-destructive disabled:opacity-50">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
