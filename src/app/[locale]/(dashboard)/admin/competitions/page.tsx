import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { Trophy } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("admin.competitionsList");
  return { title: `${t("pageTitle")} | Schulab` };
}

const statusColor: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-800",
  ONGOING: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
};

const KNOWN_STATUSES = new Set(Object.keys(statusColor));

export default async function AdminCompetitionsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/dashboard");

  const [t, tStatus, locale] = await Promise.all([
    getTranslations("admin.competitionsList"),
    getTranslations("admin.competitionsList.status"),
    getLocale(),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  let competitions: Array<{ id: string; title: string; status: string; startDate: Date | null; endDate: Date | null; maxParticipants: number | null }> = [];
  try {
    competitions = await db.competition.findMany({ orderBy: { startDate: "desc" } });
  } catch { /* no db */ }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">
            {t("competitionCount", { count: competitions.length })}
          </p>
        </div>
        <Link href="/competitions" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          {t("viewPublic")}
        </Link>
      </div>

      {competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Trophy className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t("emptyMessage")}</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t("titleCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("statusCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("startDateCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("endDateCol")}</th>
                <th className="px-4 py-3 text-start font-medium">{t("maxParticipantsCol")}</th>
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
                      {KNOWN_STATUSES.has(c.status) ? tStatus(c.status) : c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.startDate ? dateFormatter.format(new Date(c.startDate)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.endDate ? dateFormatter.format(new Date(c.endDate)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.maxParticipants ?? t("unlimited")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
