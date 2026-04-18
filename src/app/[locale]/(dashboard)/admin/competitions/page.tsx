import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus } from "lucide-react";

export const metadata = { title: "Competitions | Admin | Schulab" };

export default async function AdminCompetitionsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  let competitions: Array<{ id: string; title: string; status: string; startDate: Date | null; endDate: Date | null; maxParticipants: number | null }> = [];
  try {
    competitions = await db.competition.findMany({ orderBy: { startDate: "desc" } });
  } catch { /* no db */ }

  const statusColor: Record<string, string> = {
    UPCOMING: "bg-blue-100 text-blue-800",
    ONGOING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitions</h1>
          <p className="text-muted-foreground">{competitions.length} competitions</p>
        </div>
        <Link href="/competitions" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          View Public Page
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Trophy className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No competitions yet</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Start Date</th>
                <th className="px-4 py-3 text-left font-medium">End Date</th>
                <th className="px-4 py-3 text-left font-medium">Max Participants</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {competitions.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/admin/competitions/${c.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[c.status] ?? "bg-gray-100"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.maxParticipants ?? "Unlimited"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
