import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getCourseBySlug } from "@/services/course.service";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/course/enroll-button";
import {
  BookOpen,
  Clock,
  Users,
  Award,
  ChevronDown,
  Play,
  CheckCircle2,
  GraduationCap,
  Globe,
} from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  return {
    title: `${course.title} | Schulab`,
    description: course.description,
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;
  const [course, session] = await Promise.all([getCourseBySlug(slug), auth()]);

  if (!course) notFound();

  const totalMinutes = Math.round((course.totalDuration ?? 0) / 60);

  // Fetch related courses (same category, different course)
  let relatedCourses: { id: string; title: string; slug: string; thumbnail: string | null; category: string | null }[] = [];
  try {
    if (course.category) {
      relatedCourses = await db.course.findMany({
        where: {
          category: course.category,
          status: "PUBLISHED",
          id: { not: course.id },
        },
        select: { id: true, title: true, slug: true, thumbnail: true, category: true },
        take: 3,
      });
    }
  } catch {
    // graceful degradation
  }

  const ageLabel: Record<string, string> = {
    AGES_3_5: "3–5",
    AGES_6_8: "6–8",
    AGES_9_12: "9–12",
    AGES_13_15: "13–15",
    AGES_16_18: "16–18",
  };

  const levelColors: Record<string, string> = {
    BEGINNER: "bg-green-100 text-green-800",
    INTERMEDIATE: "bg-yellow-100 text-yellow-800",
    ADVANCED: "bg-red-100 text-red-800",
  };

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );

  // Check enrollment status for logged-in users
  let enrollmentStatus: "ACTIVE" | "COMPLETED" | null = null;
  if (session?.user) {
    try {
      const enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        select: { status: true },
      });
      if (enrollment) {
        enrollmentStatus = enrollment.status as "ACTIVE" | "COMPLETED";
      }
    } catch {
      // graceful degradation
    }
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstLessonId = allLessons[0]?.id;

  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/courses" className="hover:text-primary">
                Courses
              </Link>
              <span>/</span>
              <span>{course.title}</span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {course.ageGroup && (
                <Badge variant="secondary">
                  Ages {ageLabel[course.ageGroup] ?? course.ageGroup}
                </Badge>
              )}
              {course.level && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    levelColors[course.level] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                </span>
              )}
              {course.category && (
                <Badge variant="outline">{course.category}</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              {course.title}
            </h1>

            <p className="mt-4 text-muted-foreground">{course.description}</p>

            {/* Stats row */}
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{totalLessons} lessons</span>
              </div>
              {totalMinutes > 0 && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{totalMinutes} min total</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{course.enrollmentCount} students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>Certificate included</span>
              </div>
            </div>
          </div>

          {/* Enroll Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="mb-4 w-full rounded-lg object-cover aspect-video"
                />
              ) : (
                <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <div className="mb-4 text-center">
                <span className="text-3xl font-bold">
                  {course.isFree || !course.price || Number(course.price) === 0
                    ? "Free"
                    : `${course.currency} ${Number(course.price).toFixed(2)}`}
                </span>
              </div>

              {session?.user ? (
                <EnrollButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  firstLessonId={firstLessonId}
                  isFree={course.isFree || !course.price || Number(course.price) === 0}
                  price={course.price ? String(course.price) : undefined}
                  currency={course.currency}
                  enrollmentStatus={enrollmentStatus}
                />
              ) : (
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                  Create Free Account to Enroll
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Full lifetime access
              </p>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="mt-12 rounded-xl border bg-card p-8">
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            What You&apos;ll Learn
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {course.modules.slice(0, 6).map((mod) => (
              <div key={mod.id} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  {mod.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Who This Course Is For */}
        <div className="mt-8 rounded-xl border bg-card p-8">
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Who This Course Is For
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {course.ageGroup && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Children ages {ageLabel[course.ageGroup] ?? course.ageGroup}
                </span>
              </div>
            )}
            {course.level && (
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  {course.level.charAt(0) + course.level.slice(1).toLowerCase()}{" "}
                  level — {course.level === "BEGINNER" ? "no prior knowledge needed" : "some foundation required"}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Available in English, Arabic, and German
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Certificate of completion included
              </span>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-bold">
            Course Content — {course.modules.length} modules, {totalLessons} lessons
          </h2>
          {course.modules.length === 0 ? (
            <p className="text-muted-foreground">No content available yet.</p>
          ) : (
            <div className="divide-y rounded-xl border bg-white">
              {course.modules.map((mod) => (
                <details key={mod.id} className="group">
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-medium hover:bg-muted">
                    <span>{mod.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {mod.lessons.length} lessons
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <ul className="divide-y border-t bg-muted/30">
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground"
                      >
                        <Play className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{lesson.title}</span>
                        {lesson.duration && (
                          <span>{Math.round(lesson.duration / 60)}m</span>
                        )}
                        {lesson.isFree && (
                          <Badge variant="secondary" className="text-xs">
                            Free preview
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold">Related Courses</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {relatedCourses.map((related) => (
                <Link
                  key={related.id}
                  href={`/courses/${related.slug}`}
                  className="group rounded-xl border bg-card p-4 transition-all hover:shadow-md"
                >
                  {related.thumbnail ? (
                    <img
                      src={related.thumbnail}
                      alt={related.title}
                      className="w-full rounded-lg object-cover aspect-video"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="mt-3 font-semibold group-hover:text-primary transition-colors">
                    {related.title}
                  </h3>
                  {related.category && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {related.category}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
