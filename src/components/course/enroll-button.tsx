"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { enrollInCourse } from "@/actions/enrollment.actions";
import { Loader2, Play, CheckCircle2, Sparkles, Lock } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  firstLessonId?: string;
  isFree: boolean;
  enrollmentStatus?: "ACTIVE" | "COMPLETED" | null;
  // Number of unmet prerequisites; when > 0 (and not already enrolled) the
  // enrol button is locked and points the learner to the prerequisites.
  unmetPrerequisiteCount?: number;
}

export function EnrollButton({
  courseId,
  courseSlug,
  firstLessonId,
  isFree,
  enrollmentStatus,
  unmetPrerequisiteCount = 0,
}: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Already enrolled — show continue/review button
  if (enrollmentStatus === "ACTIVE") {
    return (
      <button
        type="button"
        onClick={() => {
          if (firstLessonId) {
            router.push(`/student/learn/${courseSlug}/${firstLessonId}`);
          } else {
            router.push("/student/courses");
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        <Play className="h-4 w-4" />
        Continue Learning
      </button>
    );
  }

  if (enrollmentStatus === "COMPLETED") {
    return (
      <div className="space-y-2">
        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-100 px-4 py-2.5 text-sm font-medium text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Course Completed
        </div>
        {firstLessonId && (
          <button
            type="button"
            onClick={() =>
              router.push(`/student/learn/${courseSlug}/${firstLessonId}`)
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Review Course
          </button>
        )}
      </div>
    );
  }

  // Not enrolled, but prerequisites are unmet — lock enrolment and direct the
  // learner to finish the prerequisites first (the server enforces this too).
  if (unmetPrerequisiteCount > 0) {
    return (
      <div className="space-y-2">
        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-100 px-4 py-2.5 text-sm font-medium text-amber-800">
          <Lock className="h-4 w-4" />
          Complete {unmetPrerequisiteCount} prerequisite{unmetPrerequisiteCount === 1 ? "" : "s"} first
        </div>
        <p className="text-center text-xs text-muted-foreground">
          See the prerequisites below to unlock this course.
        </p>
      </div>
    );
  }

  // Not enrolled — call enrollInCourse and let the server decide. Free courses
  // enrol immediately; paid (subscription-gated) courses succeed when the user
  // already has an active plan, and otherwise return the "subscribe first"
  // error, which we surface as a redirect to /pricing.
  async function handleEnroll() {
    setLoading(true);
    setError(null);

    const result = await enrollInCourse(courseId);

    if (!result.success) {
      const errMessage = result.error ?? "";
      if (/not authenticated/i.test(errMessage)) {
        router.push("/login");
        return;
      }
      if (/subscri/i.test(errMessage)) {
        router.push("/pricing");
        return;
      }
      setError(errMessage || "Failed to enroll");
      setLoading(false);
      return;
    }

    if (firstLessonId) {
      router.push(`/student/learn/${courseSlug}/${firstLessonId}`);
    } else {
      router.push("/student/courses");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isFree ? "Enrolling..." : "Checking subscription..."}
          </>
        ) : isFree ? (
          <>
            <Play className="h-4 w-4" />
            Enroll for Free
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Subscribe to access
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
