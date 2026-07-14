"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createTutorAssignment } from "@/actions/tutor-assignment.actions";

type Learner = {
  id: string;
  name: string;
  email: string;
  courses: Array<{
    id: string;
    title: string;
    modules: Array<{ title: string; lessons: Array<{ id: string; title: string }> }>;
  }>;
};

export function AssignmentForm({ learners }: { learners: Learner[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState(learners[0]?.id ?? "");
  const learner = learners.find((item) => item.id === studentId);
  const [courseId, setCourseId] = useState(learner?.courses[0]?.id ?? "");
  const course = learner?.courses.find((item) => item.id === courseId);
  const lessons =
    course?.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({ ...lesson, module: module.title }))
    ) ?? [];
  const [message, setMessage] = useState<string | null>(null);

  function selectLearner(id: string) {
    setStudentId(id);
    const next = learners.find((item) => item.id === id);
    setCourseId(next?.courses[0]?.id ?? "");
  }

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await createTutorAssignment({
        studentId,
        courseId,
        lessonId: String(formData.get("lessonId") ?? "") || null,
        title: String(formData.get("title") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        kind: String(formData.get("kind") ?? "ASSIGNMENT") as "ASSIGNMENT" | "QUIZ" | "PROJECT",
        dueAt: String(formData.get("dueAt") ?? "") || null,
        maxPoints: Number(formData.get("maxPoints") ?? 100),
      });
      if (result.success && result.assignmentId) {
        router.push(`/tutor/teaching/assignments/${result.assignmentId}`);
        router.refresh();
      } else {
        setMessage(result.error ?? "Could not create assignment");
      }
    });
  }

  return (
    <form action={onSubmit} className="card-premium space-y-5 p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">
          Learner
          <select value={studentId} onChange={(event) => selectLearner(event.target.value)} className="input-pretty w-full">
            {learners.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Course
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="input-pretty w-full" required>
            {(learner?.courses ?? []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium">
        Lesson (optional)
        <select name="lessonId" className="input-pretty w-full">
          <option value="">Course-level task</option>
          {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.module} — {lesson.title}</option>)}
        </select>
      </label>

      <div className="grid gap-5 md:grid-cols-[1fr_12rem]">
        <label className="space-y-1.5 text-sm font-medium">
          Title
          <input name="title" maxLength={160} required className="input-pretty w-full" placeholder="Build a maze game" />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Type
          <select name="kind" className="input-pretty w-full">
            <option value="ASSIGNMENT">Assignment</option>
            <option value="QUIZ">Quiz / questions</option>
            <option value="PROJECT">Project</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium">
        Instructions
        <textarea name="instructions" required rows={7} maxLength={10000} className="input-pretty w-full p-3" placeholder="Explain the task, expected evidence, and success criteria…" />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">
          Due date (optional)
          <input name="dueAt" type="datetime-local" className="input-pretty w-full" />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Maximum points
          <input name="maxPoints" type="number" min={1} max={10000} defaultValue={100} required className="input-pretty w-full" />
        </label>
      </div>

      {(!courseId || learner?.courses.length === 0) && (
        <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          This learner has no active or completed course enrollment, so an assignment cannot be created.
        </p>
      )}
      {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
      <button type="submit" disabled={pending || !courseId} className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {pending ? "Publishing…" : "Publish assignment"}
      </button>
    </form>
  );
}
