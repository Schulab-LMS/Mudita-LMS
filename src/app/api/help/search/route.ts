import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/services/help.service";
import { db } from "@/lib/db";

const SUPPORTED_LOCALES = ["en", "ar", "de"] as const;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim() ?? "";
  const rawLocale = searchParams.get("locale") ?? "en";
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale)
    ? rawLocale
    : "en";

  // Silently ignore queries that are too short or suspiciously long —
  // `contains` against a 50k-char string is a cheap DoS vector.
  if (
    !query ||
    query.length < MIN_QUERY_LENGTH ||
    query.length > MAX_QUERY_LENGTH
  ) {
    return NextResponse.json({ articles: [] });
  }

  const articles = await searchArticles(query);

  // Log search asynchronously (fire and forget)
  db.helpSearchLog
    .create({ data: { query, resultsCount: articles.length, locale } })
    .catch(() => {});

  return NextResponse.json({ articles });
}
