import { NextRequest, NextResponse } from "next/server";
import { listApprovedReviews } from "@/services/review.service";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const courseId = searchParams.get("courseId");
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawLimit = Number(searchParams.get("limit") ?? DEFAULT_LIMIT);
  // Clamp to [1, MAX_LIMIT] to block DoS via ?limit=9999999999.
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit) || DEFAULT_LIMIT, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const rows = await listApprovedReviews(courseId, { limit, cursor });
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      helpfulCount: r.helpfulCount,
      createdAt: r.createdAt,
      user: r.user,
    })),
    nextCursor: hasMore ? items[items.length - 1]!.id : null,
  });
}
