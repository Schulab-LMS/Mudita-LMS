import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorByUserId } from "@/services/tutor.service";
import { getBookingsForTutor } from "@/services/booking.service";
import { Avatar } from "@/components/ui/avatar";

export const metadata = { title: "My Students | Mudita LMS" };

export default async function TutorStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TUTOR") redirect("/dashboard");

  const tutor = await getTutorByUserId(session.user.id);
  if (!tutor) redirect("/tutor");

  const bookings = await getBookingsForTutor(tutor.id);

  // Derive unique students with session counts
  const studentMap = new Map<
    string,
    { name: string; email: string; avatar: string | null; sessions: number }
  >();

  for (const booking of bookings) {
    const key = booking.student.email;
    const existing = studentMap.get(key);
    if (existing) {
      existing.sessions += 1;
    } else {
      studentMap.set(key, {
        name: booking.student.name,
        email: booking.student.email,
        avatar: booking.student.avatar,
        sessions: 1,
      });
    }
  }

  const students = Array.from(studentMap.values()).sort(
    (a, b) => b.sessions - a.sessions
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Students</h1>
        <p className="text-muted-foreground">
          {students.length} unique student{students.length !== 1 ? "s" : ""}
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-5xl">👨‍🎓</p>
          <p className="mt-3 text-lg font-medium">No students yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Students will appear here once they book sessions with you.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="divide-y">
            {students.map((student) => {
              const initials = student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={student.email}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <Avatar
                    src={student.avatar ?? undefined}
                    fallback={initials}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{student.sessions}</p>
                    <p className="text-xs text-muted-foreground">
                      session{student.sessions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
