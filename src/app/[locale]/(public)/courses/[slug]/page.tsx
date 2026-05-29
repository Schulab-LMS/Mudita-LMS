import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCourseBySlug } from "@/services/course.service";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RatingStars } from "@/components/ui/rating-stars";
import { EnrollButton } from "@/components/course/enroll-button";
import { CategoryIcon } from "@/components/illustrations/category-icons";
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
  Shield,
  Infinity as InfinityIcon,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

interface CourseDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

// Plain helper — moved out of render so React Compiler's purity rule is satisfied.
function daysSince(date: Date | string | number): number {
  const created = new Date(date).getTime();
  const now = new Date().getTime();
  return (now - created) / (1000 * 60 * 60 * 24);
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
  const [course, session, t, tAge, tLevel, tCat] = await Promise.all([
    getCourseBySlug(slug),
    auth(),
    getTranslations("courseDetail"),
    getTranslations("courses.ageGroups"),
    getTranslations("courses.levels"),
    getTranslations("courses.categories"),
  ]);

  if (!course) notFound();

  const totalMinutes = Math.round((course.totalDuration ?? 0) / 60);

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
        take: 6,
      });
    }
  } catch {
    // graceful degradation
  }

  const levelBadgeTone: Record<string, string> = {
    BEGINNER: "chip chip-success",
    INTERMEDIATE: "chip chip-accent",
    ADVANCED: "chip chip-secondary",
  };

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );

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
  const rating = Number(course.averageRating ?? 0);
  const reviewCount = course.reviewCount ?? 0;
  // Course access is either free or subscription-gated — individual purchases
  // were retired. Any course with a non-zero price falls back to the lowest
  // paid tier at enrolment time (see enrollInCourse).
  const isFreeCourse =
    course.isFree || !course.price || Number(course.price) === 0;
  const priceDisplay = isFreeCourse
    ? t("free")
    : t("includedWithPlan", {
        plan: course.requiredPlan ?? t("subscribersOnlyPlan"),
      });
  const isBestseller = course.enrollmentCount >= 50 && rating >= 4.5;
  // Server component — Date is evaluated once per request, which is the
  // semantics we want for "published in the last 30 days".
  const isNew = daysSince(course.createdAt) < 30;

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumbs
          className="mb-5"
          items={[
            { label: t("breadcrumbCourses"), href: "/courses" },
            { label: course.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Badges row */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {isBestseller && (
                <span className="chip chip-accent">
                  <Sparkles className="h-3 w-3" /> Bestseller
                </span>
              )}
              {isNew && !isBestseller && <span className="chip chip-primary">New</span>}
              {course.ageGroup && <Badge variant="secondary">{tAge(course.ageGroup)}</Badge>}
              {course.level && (
                <span className={levelBadgeTone[course.level] ?? "chip chip-neutral"}>
                  {tLevel(course.level)}
                </span>
              )}
              {course.category && <Badge variant="outline">{tCat(course.category)}</Badge>}
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {course.title}
            </h1>

            <p className="mt-3 text-base text-muted-foreground sm:text-lg">{course.description}</p>

            {/* Trust strip: rating + enrolled + certificate + language */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <RatingStars value={rating} showValue size="sm" />
                  <span className="text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" aria-hidden />
                <span>{t("studentsCount", { count: course.enrollmentCount })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="h-4 w-4" aria-hidden />
                <span>{t("lessonsCount", { count: totalLessons })}</span>
              </div>
              {totalMinutes > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" aria-hidden />
                  <span>{t("minutesTotal", { count: totalMinutes })}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Globe className="h-4 w-4" aria-hidden />
                <span>{t("availableLanguages")}</span>
              </div>
            </div>

            {/* Skills tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills you&apos;ll gain</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {course.tags.map((tag: string) => (
                    <span key={tag} className="chip chip-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky enroll sidebar (desktop) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-elev">
              {/* Preview / thumbnail */}
              {course.thumbnail ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  {course.previewVideo && (
                    <button
                      type="button"
                      aria-label="Play preview"
                      className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity hover:opacity-100"
                    >
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-foreground shadow-lg">
                        <Play className="ms-1 h-6 w-6" aria-hidden />
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-launch-gradient-soft">
                  <CategoryIcon category={course.category || "rocket"} size={80} />
                </div>
              )}

              {/* Price */}
              <div>
                <p className="font-display text-3xl font-bold leading-none">{priceDisplay}</p>
                {!isFreeCourse && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("subscriptionAccessNote")}
                  </p>
                )}
              </div>

              {/* Primary CTA */}
              {session?.user ? (
                <EnrollButton
                  courseId={course.id}
                  courseSlug={course.slug}
                  firstLessonId={firstLessonId}
                  isFree={isFreeCourse}
                  enrollmentStatus={enrollmentStatus}
                />
              ) : (
                <Link
                  href="/register"
                  className="shine flex w-full items-center justify-center rounded-xl bg-launch-gradient px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {t("createAccountToEnroll")}
                </Link>
              )}

              {/* Guarantee list */}
              <ul className="space-y-2 pt-1 text-sm">
                <GuaranteeItem icon={<RefreshCcw className="h-4 w-4" />}>30-day money-back guarantee</GuaranteeItem>
                <GuaranteeItem icon={<InfinityIcon className="h-4 w-4" />}>{t("lifetimeAccess")}</GuaranteeItem>
                <GuaranteeItem icon={<Award className="h-4 w-4" />}>{t("certificateIncluded")}</GuaranteeItem>
                <GuaranteeItem icon={<Shield className="h-4 w-4" />}>COPPA-safe for kids</GuaranteeItem>
              </ul>
            </div>
          </aside>
        </div>

        {/* What you'll learn */}
        <section className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            {t("whatYoullLearn")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {course.modules.slice(0, 6).map((mod) => (
              <div key={mod.id} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm text-muted-foreground">
                  {mod.title}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <GraduationCap className="h-5 w-5 text-primary" />
            {t("whoItsFor")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {course.ageGroup && (
              <div className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t("childrenAges", { range: tAge(course.ageGroup) })}
                </span>
              </div>
            )}
            {course.level && (
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {course.level === "BEGINNER"
                    ? t("levelBeginnerBody", { level: tLevel(course.level) })
                    : t("levelAdvancedBody", { level: tLevel(course.level) })}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("availableLanguages")}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t("certificateOfCompletion")}
              </span>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold">
            {t("courseContentSummary", {
              modules: course.modules.length,
              lessons: totalLessons,
            })}
          </h2>
          {course.modules.length === 0 ? (
            <p className="text-muted-foreground">{t("noContentYet")}</p>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {course.modules.map((mod, idx) => (
                <details key={mod.id} className="group" open={idx < 2}>
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-muted/40">
                    <span className="truncate">{mod.title}</span>
                    <div className="flex shrink-0 items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        {t("lessonsCount", { count: mod.lessons.length })}
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 rtl:rotate-0 rtl:group-open:-rotate-180" />
                    </div>
                  </summary>
                  <ul className="divide-y divide-border border-t border-border bg-muted/30">
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground"
                      >
                        <Play className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
                        <span className="flex-1 truncate">{lesson.title}</span>
                        {lesson.duration && (
                          <span>{t("minutesShort", { count: Math.round(lesson.duration / 60) })}</span>
                        )}
                        {lesson.isFree && (
                          <Badge variant="secondary" className="text-xs">
                            {t("freePreview")}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Related courses */}
        {relatedCourses.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold">{t("relatedCourses")}</h2>
            <div className="-mx-4 overflow-x-auto sm:mx-0">
              <div className="flex gap-4 px-4 pb-4 sm:grid sm:grid-cols-2 sm:px-0 md:grid-cols-3">
                {relatedCourses.map((related) => (
                  <Link
                    key={related.id}
                    href={`/courses/${related.slug}`}
                    className="group min-w-[260px] shrink-0 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-elev sm:min-w-0 sm:shrink"
                  >
                    {related.thumbnail ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                        <Image
                          src={related.thumbnail}
                          alt={related.title}
                          fill
                          sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 80vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-xl bg-launch-gradient-soft">
                        <CategoryIcon category={related.category || "rocket"} size={56} />
                      </div>
                    )}
                    <h3 className="mt-3 font-semibold leading-tight group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    {related.category && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {tCat(related.category)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-4 py-3 shadow-hero backdrop-blur-md lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{course.title}</p>
          <p className="font-display text-xl font-bold leading-none">{priceDisplay}</p>
        </div>
        {session?.user ? (
          <EnrollButton
            courseId={course.id}
            courseSlug={course.slug}
            firstLessonId={firstLessonId}
            isFree={isFreeCourse}
            enrollmentStatus={enrollmentStatus}
          />
        ) : (
          <Link
            href="/register"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-launch-gradient px-5 text-sm font-semibold text-white shadow-md"
          >
            {t("createAccountToEnroll")}
          </Link>
        )}
      </div>
    </div>
  );
}

function GuaranteeItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-muted-foreground">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span>{children}</span>
    </li>
  );
}
