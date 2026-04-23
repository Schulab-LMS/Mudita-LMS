import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";

// Append-only reader view for AuditLog entries. Admins often need to answer
// "who last touched this record and when?" — this page gives a paginated,
// filter-by-resource / actor view onto the existing log. It intentionally
// exposes no mutating controls: AuditLog is immutable by design.

const PAGE_SIZE = 50;

type SearchParams = {
  resource?: string;
  actor?: string;
  action?: string;
  page?: string;
};

export const metadata = { title: "Audit Log | Schulab" };

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const sp = await searchParams;
  const locale = await getLocale();
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = {};
  if (sp.resource) where.resource = sp.resource;
  if (sp.actor) where.actorId = sp.actor;
  if (sp.action) where.action = { contains: sp.action };

  const [entries, total, distinctResources] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      distinct: ["resource"],
      select: { resource: true },
      orderBy: { resource: "asc" },
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Append-only record of admin and sensitive user actions. {total.toLocaleString(locale)} total entries.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4" action="/admin/audit">
        <div className="flex flex-col gap-1">
          <label htmlFor="resource" className="text-xs font-medium text-muted-foreground">
            Resource
          </label>
          <select
            id="resource"
            name="resource"
            defaultValue={sp.resource ?? ""}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            <option value="">All</option>
            {distinctResources.map((r) => (
              <option key={r.resource} value={r.resource}>
                {r.resource}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="action" className="text-xs font-medium text-muted-foreground">
            Action contains
          </label>
          <input
            id="action"
            name="action"
            defaultValue={sp.action ?? ""}
            placeholder="e.g. course.update"
            className="h-9 rounded-md border bg-background px-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="actor" className="text-xs font-medium text-muted-foreground">
            Actor user id
          </label>
          <input
            id="actor"
            name="actor"
            defaultValue={sp.actor ?? ""}
            placeholder="cuid…"
            className="h-9 w-64 rounded-md border bg-background px-2 text-sm font-mono"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
        {(sp.resource || sp.actor || sp.action) && (
          <Link
            href="/admin/audit"
            className="h-9 rounded-md border px-3 text-sm font-medium leading-9 hover:bg-muted"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">When</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">Actor</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">Resource</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">Metadata</th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">IP</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No audit entries match these filters.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-b last:border-0 align-top hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(e.createdAt))}
                  </td>
                  <td className="px-4 py-3">
                    {e.actor ? (
                      <>
                        <div className="font-medium">{e.actor.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{e.actor.email}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">system</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.resource}</div>
                    {e.resourceId && (
                      <code className="text-[11px] text-muted-foreground">
                        {e.resourceId.slice(0, 12)}…
                      </code>
                    )}
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    {e.metadata ? (
                      <pre className="overflow-hidden whitespace-pre-wrap break-words text-[11px] text-muted-foreground">
                        {JSON.stringify(e.metadata, null, 0)}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {e.ipAddress ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <PageLink
                sp={sp}
                page={page - 1}
                label="← Previous"
              />
            )}
            {page < totalPages && (
              <PageLink sp={sp} page={page + 1} label="Next →" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  sp,
  page,
  label,
}: {
  sp: SearchParams;
  page: number;
  label: string;
}) {
  const params = new URLSearchParams();
  if (sp.resource) params.set("resource", sp.resource);
  if (sp.action) params.set("action", sp.action);
  if (sp.actor) params.set("actor", sp.actor);
  params.set("page", String(page));
  return (
    <Link
      href={`/admin/audit?${params.toString()}`}
      className="rounded-md border px-3 py-1.5 font-medium hover:bg-muted"
    >
      {label}
    </Link>
  );
}
