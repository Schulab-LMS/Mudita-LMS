import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

type RawEnrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  enrolledAt: Date;
};

const enrollmentSelect = {
  id: true,
  userId: true,
  courseId: true,
  status: true,
  progress: true,
  enrolledAt: true,
} as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return noStoreJson({ error: "unauthorized" }, 401);
  }
  if (!isAdminRole(session.user.role)) {
    return noStoreJson({ error: "forbidden" }, 403);
  }

  const parsed = querySchema.safeParse({
    email: new URL(request.url).searchParams.get("email"),
  });
  if (!parsed.success) {
    return noStoreJson({ error: "valid_email_required" }, 400);
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      _count: { select: { enrollments: true } },
      enrollments: { select: enrollmentSelect, orderBy: { enrolledAt: "desc" } },
    },
  });
  if (!user) {
    return noStoreJson({ error: "user_not_found" }, 404);
  }

  const [direct, relational, raw] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: user.id },
      select: enrollmentSelect,
      orderBy: { enrolledAt: "desc" },
    }),
    db.enrollment.findMany({
      where: { user: { email: user.email } },
      select: enrollmentSelect,
      orderBy: { enrolledAt: "desc" },
    }),
    db.$queryRaw<RawEnrollment[]>`
      SELECT "id", "userId", "courseId", "status"::text, "progress", "enrolledAt"
      FROM "Enrollment"
      WHERE "userId" = ${user.id}
      ORDER BY "enrolledAt" DESC
    `,
  ]);

  const counts = {
    relationCount: user._count.enrollments,
    nestedRows: user.enrollments.length,
    directRows: direct.length,
    relationalRows: relational.length,
    rawRows: raw.length,
  };

  return noStoreJson({
    checkedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    counts,
    consistent: new Set(Object.values(counts)).size === 1,
    rows: {
      nested: user.enrollments,
      direct,
      relational,
      raw,
    },
  });
}

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
