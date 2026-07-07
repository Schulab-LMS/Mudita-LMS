import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/page-header";
import {
  ClipboardList,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

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

export const metadata = { title: "Audit Log" };

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

  const where: {
    resource?: string;
    actorId?: string;
    action?: { contains: string };
  } = {};
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
  const activeFilters = [sp.resource, sp.actor, sp.action].filter(
    Boolean
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description={`Append-only record of admin and sensitive user actions · ${total.toLocaleString(
          locale
        )} total entries`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Audit Log" },
        ]}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-muted/40 px-3 text-xs font-semibold text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Read-only
          </span>
        }
      />

      {/* Filters */}
      <form
        className="card-premium flex flex-wrap items-end gap-3 p-4"
        action="/admin/audit"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="resource"
            className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Resource
          </label>
          <select
            id="resource"
            name="resource"
            defaultValue={sp.resource ?? ""}
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
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
          <label
            htmlFor="action"
            className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Action contains
          </label>
          <input
            id="action"
            name="action"
            defaultValue={sp.action ?? ""}
            placeholder="e.g. course.update"
            className="input-pretty h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="actor"
            className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Actor user id
          </label>
          <input
            id="actor"
            name="actor"
            defaultValue={sp.actor ?? ""}
            placeholder="cuid…"
            className="input-pretty h-10 w-64 rounded-lg border border-input bg-background px-3 font-mono text-xs focus-visible:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Filter className="h-3.5 w-3.5" aria-hidden />
          Filter
        </button>
        {activeFilters > 0 && (
          <Link
            href="/admin/audit"
            className="inline-flex h-10 items-center rounded-lg border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  When
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actor
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Resource
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Metadata
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                      <ClipboardList className="h-6 w-6" aria-hidden />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">
                      No audit entries
                    </p>
                    <p className="mt-1 text-xs">
                      {activeFilters > 0
                        ? "Try clearing filters."
                        : "Admin actions will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr
                    key={e.id}
                    className="align-top transition-colors hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(e.createdAt))}
                    </td>
                    <td className="px-5 py-3">
                      {e.actor ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-[10px] font-semibold text-foreground">
                            {getInitials(e.actor.name ?? "?")}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {e.actor.name ?? "—"}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                              {e.actor.email}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" aria-hidden />
                          system
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <code className="rounded-md bg-muted px-2 py-1 font-mono text-[11px] text-foreground">
                        {e.action}
                      </code>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">
                        {e.resource}
                      </div>
                      {e.resourceId && (
                        <code className="text-[11px] text-muted-foreground">
                          {e.resourceId.slice(0, 12)}…
                        </code>
                      )}
                    </td>
                    <td className="max-w-sm px-5 py-3">
                      {e.metadata ? (
                        <pre className="overflow-hidden whitespace-pre-wrap break-words rounded-md bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
                          {JSON.stringify(e.metadata, null, 0)}
                        </pre>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[11px] text-muted-foreground">
                      {e.ipAddress ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>{" "}
              · {total.toLocaleString(locale)} total
            </span>
            <div className="flex gap-1">
              {page > 1 && (
                <PageLink sp={sp} page={page - 1}>
                  <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                  Previous
                </PageLink>
              )}
              {page < totalPages && (
                <PageLink sp={sp} page={page + 1}>
                  Next
                  <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
                </PageLink>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageLink({
  sp,
  page,
  children,
}: {
  sp: SearchParams;
  page: number;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (sp.resource) params.set("resource", sp.resource);
  if (sp.action) params.set("action", sp.action);
  if (sp.actor) params.set("actor", sp.actor);
  params.set("page", String(page));
  return (
    <Link
      href={`/admin/audit?${params.toString()}`}
      className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
    >
      {children}
    </Link>
  );
}
