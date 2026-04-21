"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { enrollInCourse } from "@/actions/enrollment.actions";
import { buyCourse } from "@/actions/billing.actions";
import { Loader2, Play, CheckCircle2, ShoppingCart } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  firstLessonId?: string;
  isFree: boolean;
  price?: string;
  currency?: string;
  enrollmentStatus?: "ACTIVE" | "COMPLETED" | null;
}

export function EnrollButton({
  courseId,
  courseSlug,
  firstLessonId,
  isFree,
  price,
  currency,
  enrollmentStatus,
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

  // Not enrolled — show enroll button
  async function handleEnroll() {
    setLoading(true);
    setError(null);

    if (!isFree) {
      const result = await buyCourse({ courseId });
      if (!result.success) {
        if (/not authenticated/i.test(result.error)) {
          router.push("/login");
          return;
        }
        setError(result.error);
        setLoading(false);
        return;
      }
      // Hand off to Stripe — full-page redirect (not a client router push).
      window.location.assign(result.data.url);
      return;
    }

    const result = await enrollInCourse(courseId);

    if (!result.success) {
      setError(result.error || "Failed to enroll");
      setLoading(false);
      return;
    }

    // Enrolled successfully — redirect to first lesson or courses page
    if (firstLessonId) {
      router.push(`/student/learn/${courseSlug}/${firstLessonId}`);
    } else {
      router.push("/student/courses");
    }
  }

  const priceDisplay =
    isFree || !price || price === "0"
      ? "Free"
      : `${currency ?? "USD"} ${price}`;

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
            Enrolling...
          </>
        ) : isFree ? (
          <>
            <Play className="h-4 w-4" />
            Enroll Now — {priceDisplay}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            Enroll — {priceDisplay}
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
