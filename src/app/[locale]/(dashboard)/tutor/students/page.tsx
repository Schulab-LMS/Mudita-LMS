import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoResultsScene } from "@/components/illustrations/empty-scenes";
import { Users, MessageSquare, Calendar, Trophy } from "lucide-react";
import { getInitials } from "@/lib/utils";

export const metadata = { title: "My Students" };

export default async function TutorStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutor = await getTutorByUserId(session.user.id);
  if (!tutor) redirect("/tutor");

  const bookings = await getBookingsForTutor(tutor.id);

  // Derive unique students with richer metadata
  const studentMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      sessions: number;
      completed: number;
      lastSession: Date;
    }
  >();

  for (const booking of bookings) {
    const key = booking.student.email;
    const isCompleted = booking.status === "COMPLETED";
    const existing = studentMap.get(key);
    if (existing) {
      existing.sessions += 1;
      if (isCompleted) existing.completed += 1;
      const bookingStart = new Date(booking.startTime);
      if (bookingStart > existing.lastSession) {
        existing.lastSession = bookingStart;
      }
    } else {
      studentMap.set(key, {
        id: booking.studentId,
        name: booking.student.name,
        email: booking.student.email,
        avatar: booking.student.avatar,
        sessions: 1,
        completed: isCompleted ? 1 : 0,
        lastSession: new Date(booking.startTime),
      });
    }
  }

  const students = Array.from(studentMap.values()).sort(
    (a, b) => b.sessions - a.sessions
  );

  const totalSessions = students.reduce((s, st) => s + st.sessions, 0);
  const totalCompleted = students.reduce((s, st) => s + st.completed, 0);

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Students"
        description={`${students.length} unique student${
          students.length === 1 ? "" : "s"
        } · ${totalSessions} total session${
          totalSessions === 1 ? "" : "s"
        } · ${totalCompleted} completed`}
        breadcrumbs={[
          { label: "Tutor", href: "/tutor" },
          { label: "Students" },
        ]}
        icon={<Users className="h-5 w-5" />}
      />

      {students.length === 0 ? (
        <EmptyState
          illustration={<NoResultsScene />}
          title="No students yet"
          description="Students will appear here once they book their first session with you."
          action={{ label: "View availability", href: "/tutor/availability" }}
          tone="default"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="divide-y divide-border">
            {students.map((student) => (
              <div
                key={student.email}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <Avatar
                  src={student.avatar ?? undefined}
                  fallback={getInitials(student.name)}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {student.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {student.email}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden />
                      Last: {dateFmt.format(student.lastSession)}
                    </span>
                    {student.completed > 0 && (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Trophy className="h-3 w-3" aria-hidden />
                        {student.completed} completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="hidden text-end sm:block">
                    <p className="font-display text-lg font-bold leading-none text-foreground">
                      {student.sessions}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      session{student.sessions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link
                    href={`/messages/${student.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Message"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
