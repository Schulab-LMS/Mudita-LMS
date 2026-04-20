import { db } from "@/lib/db";

export async function getPublishedArticles() {
  try {
    return await db.helpArticle.findMany({
      where: { isPublished: true },
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        slug: true,
        category: true,
        title: true,
        titleAr: true,
        titleDe: true,
        excerpt: true,
        excerptAr: true,
        excerptDe: true,
        tags: true,
        isFeatured: true,
        updatedAt: true,
      },
    });
  } catch {
    return [];
  }
}

export async function getFeaturedArticles() {
  return db.helpArticle.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { order: "asc" },
    take: 6,
    select: {
      id: true,
      slug: true,
      category: true,
      title: true,
      titleAr: true,
      titleDe: true,
      excerpt: true,
      excerptAr: true,
      excerptDe: true,
    },
  });
}

export async function getArticleBySlug(slug: string) {
  return db.helpArticle.findUnique({
    where: { slug, isPublished: true },
    include: {
      feedback: {
        select: { helpful: true },
      },
    },
  });
}

export async function searchArticles(query: string) {
  if (!query.trim()) return [];
  return db.helpArticle.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { titleAr: { contains: query, mode: "insensitive" } },
        { titleDe: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { tags: { has: query.toLowerCase() } },
      ],
    },
    orderBy: { order: "asc" },
    take: 10,
    select: {
      id: true,
      slug: true,
      category: true,
      title: true,
      titleAr: true,
      titleDe: true,
      excerpt: true,
      excerptAr: true,
      excerptDe: true,
    },
  });
}

export async function getAllArticlesAdmin() {
  return db.helpArticle.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { feedback: true } },
    },
  });
}

export async function getArticleById(id: string) {
  return db.helpArticle.findUnique({ where: { id } });
}

export async function getArticleFeedbackStats(articleId: string) {
  const [helpful, notHelpful] = await Promise.all([
    db.helpFeedback.count({ where: { articleId, helpful: true } }),
    db.helpFeedback.count({ where: { articleId, helpful: false } }),
  ]);
  return { helpful, notHelpful, total: helpful + notHelpful };
}

export async function getTopSearchQueries(limit = 10) {
  return db.helpSearchLog.groupBy({
    by: ["query"],
    _count: { query: true },
    orderBy: { _count: { query: "desc" } },
    take: limit,
  });
}
