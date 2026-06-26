import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { getEventsForAdmin } from "@/services/event.service";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EventRowActions } from "./events-actions";
import { Sparkles, Plus, ExternalLink } from "lucide-react";
import { ageRangeLabel, regionLabel, listingTone } from "@/components/events/event-format";

export const metadata = { title: "Events & Competitions | Admin" };

const STATUS_LABEL: Record<string, string> = { ACTIVE: "Active", OPTIONAL: "Optional", ARCHIVED: "Archived" };

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const events = await getEventsForAdmin();
  const counts = {
    active: events.filter((e) => e.listingStatus === "ACTIVE").length,
    optional: events.filter((e) => e.listingStatus === "OPTIONAL").length,
    archived: events.filter((e) => e.listingStatus === "ARCHIVED").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events & Competitions"
        description="Curate the external STEM events students can prepare for and map prep courses/bundles."
        icon={<Sparkles className="h-5 w-5" />}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Events & Competitions" }]}
        actions={
          <Link
            href="/admin/events/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New event
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Tile label="Active" value={counts.active} tone="text-emerald-700" />
        <Tile label="Optional" value={counts.optional} tone="text-amber-700" />
        <Tile label="Archived" value={counts.archived} tone="text-slate-500" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Region</th>
              <th className="px-4 py-3 font-semibold">Ages</th>
              <th className="px-4 py-3 font-semibold">Prep</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No events yet. Create your first one or run the catalog seed.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{e.title}</div>
                    <a
                      href={e.officialUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      {e.officialProvider}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{regionLabel(e.region)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ageRangeLabel(e.ageMin, e.ageMax)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e._count.courseRecommendations + e._count.bundleRecommendations} link
                    {e._count.courseRecommendations + e._count.bundleRecommendations === 1 ? "" : "s"}
                    {e.preparationPath ? " · path" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${listingTone(e.listingStatus)}`}>
                      {STATUS_LABEL[e.listingStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EventRowActions eventId={e.id} listingStatus={e.listingStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
