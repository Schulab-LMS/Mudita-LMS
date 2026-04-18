import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
  tone?: "indigo" | "purple" | "orange" | "green";
  rating?: number;
}

const toneMap = {
  indigo: "from-[#4f3ff0] to-[#6d28d9]",
  purple: "from-[#8b5cf6] to-[#ec4899]",
  orange: "from-[#ff8a3d] to-[#ef4444]",
  green: "from-[#34d399] to-[#4f3ff0]",
} as const;

export function TestimonialCard({
  quote,
  author,
  role,
  initials,
  tone = "indigo",
  rating = 5,
  className,
}: Testimonial & { className?: string }) {
  return (
    <figure
      className={cn(
        "card-stem relative flex h-full flex-col p-6 hover-lift shine sm:p-7",
        className
      )}
    >
      <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "fill-[#ff8a3d] text-[#ff8a3d]" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 font-display text-lg leading-relaxed text-foreground/90">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-sm font-bold text-white shadow-sm",
            toneMap[tone]
          )}
        >
          {initials}
        </div>
        <div>
          <div className="font-display text-sm font-semibold">{author}</div>
          <div className="text-xs text-muted-foreground">{role}</div>
        </div>
      </figcaption>
    </figure>
  );
}
