import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

interface TutorCardProps {
  tutor: {
    id: string;
    bio: string | null;
    subjects: string[];
    languages: string[];
    hourlyRate: number | string;
    rating: number | string;
    user: {
      name: string;
      avatar: string | null;
    };
  };
}

export function TutorCard({ tutor }: TutorCardProps) {
  const initials = tutor.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const ratingNum = Number(tutor.rating);
  const stars = ratingNum > 0 ? Math.round(ratingNum) : 0;

  const requestHref =
    "/contact?" +
    new URLSearchParams({
      subject: `Tutor session — ${tutor.user.name}`,
      message: `Hi, I'd like to book a session with ${tutor.user.name} (subjects: ${tutor.subjects.slice(0, 3).join(", ") || "any"}). Preferred days/times:`,
    }).toString();

  return (
    <div className="flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar
          src={tutor.user.avatar ?? undefined}
          fallback={initials}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{tutor.user.name}</h3>
          {stars > 0 && (
            <p className="text-sm text-amber-500">
              {"⭐".repeat(stars)}{" "}
              <span className="text-muted-foreground text-xs">
                ({Number(tutor.rating).toFixed(1)})
              </span>
            </p>
          )}
          {stars === 0 && (
            <p className="text-xs text-muted-foreground">No ratings yet</p>
          )}
        </div>
      </div>

      {tutor.bio && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
      )}

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

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-semibold">
          ${Number(tutor.hourlyRate).toFixed(0)}
          <span className="font-normal text-muted-foreground"> / hr</span>
        </p>
        <Link
          href={requestHref}
          className="inline-flex items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
        >
          Request Session
        </Link>
      </div>
    </div>
  );
}
