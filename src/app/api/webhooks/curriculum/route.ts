import { NextResponse } from "next/server";
import { after } from "next/server";
import { verifyWebhookSignature, curriculaBranch } from "@/lib/github-curricula";
import { runCurriculumSync } from "@/services/curriculum-sync.service";

// GitHub push webhook for the curriculum repo. Signature is verified against
// CURRICULA_WEBHOOK_SECRET, then the sync runs AFTER the response so GitHub's
// ~10s delivery timeout can't trigger duplicate retries mid-sync.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.CURRICULA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  if (event === "ping") {
    return NextResponse.json({ ok: true, pong: true });
  }
  if (event !== "push") {
    return NextResponse.json({ ok: true, ignored: event });
  }

  // Only react to pushes on the synced branch.
  let payload: { ref?: string } = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (payload.ref && payload.ref !== `refs/heads/${curriculaBranch()}`) {
    return NextResponse.json({ ok: true, ignored: payload.ref });
  }

  after(async () => {
    try {
      const result = await runCurriculumSync({ trigger: "WEBHOOK" });
      console.log("[curricula] webhook sync result:", result.status, result.runId);
    } catch (e) {
      console.error("[curricula] webhook sync failed:", e);
    }
  });

  return NextResponse.json({ ok: true, accepted: true }, { status: 202 });
}
