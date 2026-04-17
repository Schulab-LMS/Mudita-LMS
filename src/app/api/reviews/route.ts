import { NextRequest, NextResponse } from "next/server";
import { listApprovedReviews } from "@/services/review.service";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const courseId = searchParams.get("courseId");
  const cursor = searchParams.get("cursor") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "20") || 20;

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
