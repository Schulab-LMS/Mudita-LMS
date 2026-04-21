import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { createBillingPortalSession } from "@/services/billing.service";
import { isSafeInternalPath } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Billing is not configured on this environment." },
      { status: 503 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let returnPath: string | undefined;
  try {
    const body = (await request.json()) as { returnPath?: string };
    // A naive startsWith("/") check would accept "//evil.com/…", which
    // browsers resolve as a different origin — so Stripe would send the
    // user there on portal exit. Use the strict internal-path helper.
    if (isSafeInternalPath(body.returnPath)) returnPath = body.returnPath;
  } catch {
    // Empty body is fine — we'll use the default return path.
  }

  try {
    const { url } = await createBillingPortalSession({
      userId: session.user.id,
      returnPath,
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not open billing portal";
    console.error("[billing/portal] error:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
