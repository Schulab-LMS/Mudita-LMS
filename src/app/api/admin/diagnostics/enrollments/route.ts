import { NextResponse } from "next/server";
import { z } from "zod";
import { Pool } from "pg";
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

type RawEnrollmentOwner = RawEnrollment & {
  userEmail: string;
  userName: string;
  courseTitle: string;
};

type TextFingerprint = {
  value: string;
  length: number;
  utf8Hex: string;
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

  // Deliberately execute these in sequence. This probe exists to determine
  // whether the pg driver adapter is crossing parameter values between
  // concurrent requests made on the shared Prisma client.
  const direct = await db.enrollment.findMany({
    where: { userId: user.id },
    select: enrollmentSelect,
    orderBy: { enrolledAt: "desc" },
  });
  const relational = await db.enrollment.findMany({
    where: { user: { email: user.email } },
    select: enrollmentSelect,
    orderBy: { enrolledAt: "desc" },
  });
  const raw = await db.$queryRaw<RawEnrollment[]>`
    SELECT "id", "userId", "courseId", "status"::text, "progress", "enrolledAt"
    FROM "Enrollment"
    WHERE "userId" = ${user.id}
    ORDER BY "enrolledAt" DESC
  `;
  const allRawOwners = await db.$queryRaw<RawEnrollmentOwner[]>`
    SELECT
      e."id",
      e."userId",
      e."courseId",
      e."status"::text,
      e."progress",
      e."enrolledAt",
      u."email" AS "userEmail",
      u."name" AS "userName",
      c."title" AS "courseTitle"
    FROM "Enrollment" e
    JOIN "User" u ON u."id" = e."userId"
    JOIN "Course" c ON c."id" = e."courseId"
    ORDER BY e."enrolledAt" DESC
  `;

  // Bypass Prisma's query compiler/driver-adapter argument mapping while
  // retaining native PostgreSQL parameterization. This isolates the adapter
  // from the database, schema, and input value in the diagnostic result.
  const nativePool = new Pool({ connectionString: process.env.DATABASE_URL });
  let nodePg: RawEnrollment[];
  let nodePgAll: RawEnrollment[];
  let nodePgParameter: TextFingerprint;
  try {
    const [filteredResult, allResult, parameterResult] = await Promise.all([
      nativePool.query<RawEnrollment>(
      `SELECT "id", "userId", "courseId", "status"::text, "progress", "enrolledAt"
       FROM "Enrollment"
       WHERE "userId" = $1
       ORDER BY "enrolledAt" DESC`,
      [user.id]
      ),
      nativePool.query<RawEnrollment>(
        `SELECT "id", "userId", "courseId", "status"::text, "progress", "enrolledAt"
         FROM "Enrollment"
         ORDER BY "enrolledAt" DESC`
      ),
      nativePool.query<TextFingerprint>(
        `SELECT
           $1::text AS "value",
           length($1::text)::int AS "length",
           encode(convert_to($1::text, 'UTF8'), 'hex') AS "utf8Hex"`,
        [user.id]
      ),
    ]);
    nodePg = filteredResult.rows;
    nodePgAll = allResult.rows;
    nodePgParameter = parameterResult.rows[0];
  } finally {
    await nativePool.end();
  }

  const userIdFingerprint = fingerprint(user.id);
  const matchingOwnerFingerprints = allRawOwners
    .filter((row) => row.userId === user.id)
    .map((row) => fingerprint(row.userId));

  const counts = {
    relationCount: user._count.enrollments,
    nestedRows: user.enrollments.length,
    directRows: direct.length,
    relationalRows: relational.length,
    rawRows: raw.length,
    nodePgRows: nodePg.length,
    nodePgAllRows: nodePgAll.length,
    jsOwnerMatches: matchingOwnerFingerprints.length,
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
      allRawOwners,
      nodePg,
      nodePgAll,
    },
    fingerprints: {
      userId: userIdFingerprint,
      matchingOwnerIds: matchingOwnerFingerprints,
      nodePgParameter,
    },
  });
}

function fingerprint(value: string): TextFingerprint {
  return {
    value,
    length: value.length,
    utf8Hex: Buffer.from(value, "utf8").toString("hex"),
  };
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
