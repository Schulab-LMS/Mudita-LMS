import { headers } from "next/headers";
import { db } from "@/lib/db";

// Append-only audit log for admin + sensitive user actions. Writes are
// best-effort and never bubble up — audit failures must not block the
// action that produced them.

export type AuditContext = {
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function audit(ctx: AuditContext): Promise<void> {
  try {
    let ip = ctx.ipAddress ?? null;
    let ua = ctx.userAgent ?? null;
    if (!ip || !ua) {
      try {
        const h = await headers();
        if (!ip) ip = h.get("x-forwarded-for") ?? h.get("x-real-ip");
        if (!ua) ua = h.get("user-agent");
      } catch {
        // headers() throws outside a request context (e.g. cron). Ignore.
      }
    }

    await db.auditLog.create({
      data: {
        actorId: ctx.actorId ?? null,
        action: ctx.action,
        resource: ctx.resource,
        resourceId: ctx.resourceId ?? null,
        metadata: (ctx.metadata ?? undefined) as never,
        ipAddress: ip ?? null,
        userAgent: ua ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to persist entry:", err);
  }
}
