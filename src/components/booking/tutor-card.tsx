import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Calendar, MessageSquare } from "lucide-react";

interface TutorCardProps {
  tutor: {
    id: string;
    bio: string | null;
    subjects: string[];
    languages: string[];
    hourlyRate: number | string;
    rating: number | string;
    isVerified?: boolean;
    user: {
      name: string;
      avatar: string | null;
    };
  };
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TutorCard({ tutor }: TutorCardProps) {
  const initials = initialsOf(tutor.user.name);
  const ratingNum = Number(tutor.rating);
  const hourly = Number(tutor.hourlyRate);

  const requestHref =
    "/contact?" +
    new URLSearchParams({
      subject: `Tutor session — ${tutor.user.name}`,
      message: `Hi, I'd like to book a session with ${tutor.user.name} (subjects: ${tutor.subjects.slice(0, 3).join(", ") || "any"}). Preferred days/times:`,
    }).toString();

  return (
    <div className="card-premium group flex flex-col overflow-hidden">
      {/* Gradient accent band */}
      <div className="h-1 bg-launch-gradient-horizontal" aria-hidden />

      <div className="flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar
              src={tutor.user.avatar ?? undefined}
              fallback={initials}
              size="lg"
            />
            {/* Availability dot — placeholder green until presence data is wired */}
            <span
              aria-label="Available"
              className="absolute -bottom-0.5 -end-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-card"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold text-foreground">
                {tutor.user.name}
              </h3>
              {tutor.isVerified && (
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-label="Verified tutor"
                />
              )}
            </div>
            <div className="mt-1">
              {ratingNum > 0 ? (
                <RatingStars value={ratingNum} size="sm" showValue />
              ) : (
                <p className="text-xs text-muted-foreground">New tutor</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {tutor.bio}
          </p>
        )}

        {/* Subject chips */}
        {tutor.subjects.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tutor.subjects.slice(0, 4).map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {tutor.subjects.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{tutor.subjects.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Languages */}
        {tutor.languages.length > 0 && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            Teaches in {tutor.languages.slice(0, 3).join(", ")}
          </p>
        )}

        {/* Price + CTAs */}
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-display text-xl font-bold leading-none text-foreground">
              ${hourly.toFixed(0)}
              <span className="ms-1 text-xs font-normal text-muted-foreground">
                / hr
              </span>
            </p>
          </div>
          <div className="flex gap-1.5">
            <Link
              href={`/tutors#${tutor.id}`}
              aria-label="View profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={requestHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-launch-gradient px-3 text-xs font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden />
              Book session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
