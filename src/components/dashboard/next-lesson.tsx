import { Link } from "@/i18n/navigation";
import { Play, Clock, BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextLessonProps {
  /** Course or lesson title. */
  title: string;
  /** Short description / current chapter. */
  subtitle?: string;
  /** Minutes remaining. */
  minutes?: number;
  /** Progress 0..1. */
  progress?: number;
  /** Link to continue. */
  href: string;
  className?: string;
}

/** Hero "resume learning" card — guides the student back to the next step. */
export function NextLesson({
  title,
  subtitle,
  minutes,
  progress = 0,
  href,
  className,
}: NextLessonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1852] via-[#2d1a5e] to-[#4f3ff0] p-6 text-white shadow-lift transition-all hover:-translate-y-0.5 hover:shadow-hero",
        className
      )}
    >
      {/* Decorative glow */}
      <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-[#ff8a3d]/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-14 -left-10 h-48 w-48 rounded-full bg-[#8b5cf6]/30 blur-3xl" />

      <div className="relative flex items-center gap-5">
        {/* Play button */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/20 transition-transform group-hover:scale-105 group-hover:rotate-3">
          <Play className="h-7 w-7 fill-white text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
            <BookOpen className="h-3.5 w-3.5" />
            Next up
          </p>
          <h3 className="mt-1 truncate font-display text-xl font-bold">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-white/70">{subtitle}</p>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-white/80">
            {typeof minutes === "number" && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {minutes} min
              </span>
            )}
            {progress > 0 && (
              <span className="flex items-center gap-2">
                <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
                  <span
                    className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#fef3c7]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </span>
                <span className="font-semibold">
                  {Math.round(progress * 100)}%
                </span>
              </span>
            )}
          </div>
        </div>

        <ArrowRight className="hidden h-5 w-5 shrink-0 text-white/80 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 sm:block" />
      </div>
    </Link>
  );
}
