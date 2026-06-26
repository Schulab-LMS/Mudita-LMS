import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { renderCertificateBuffer } from "@/lib/certificate-pdf";

// Renders a signed-off PDF certificate on demand. Generating per request
// (rather than storing a pre-rendered blob on issue) keeps the completion
// pipeline fast, and lets us fix template bugs without having to backfill
// every historical certificate. Typical render is ~300-600 ms cold, <100 ms
// warm — well under the browser's default download timeout.
//
// The route is runtime=nodejs because @react-pdf/renderer depends on
// Node-only fontkit / zlib — it will not load in Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cert = await db.certificate.findUnique({
    where: { code },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const isOwner = cert.userId === session.user.id;
  if (!isOwner && !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // A certificate is for a course OR a bundle — resolve whichever it carries.
  const subject = cert.bundleId
    ? await db.bundle.findUnique({ where: { id: cert.bundleId }, select: { title: true } })
    : cert.courseId
      ? await db.course.findUnique({ where: { id: cert.courseId }, select: { title: true } })
      : null;

  const studentName = cert.user.name || cert.user.email || "Student";
  const courseTitle = subject?.title ?? (cert.bundleId ? "Bundle" : "Course");

  // Build an absolute verification URL so the printed PDF is useful on its
  // own. Prefer the configured public origin; fall back to the request host
  // if the env var is missing (dev / preview).
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const verificationUrl = `${origin.replace(/\/$/, "")}/certificates/verify/${cert.code}`;

  const buffer = await renderCertificateBuffer({
    studentName,
    courseTitle,
    issuedAt: cert.issuedAt,
    code: cert.code,
    verificationUrl,
  });

  const filename = `Schulab-Certificate-${cert.code}.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
