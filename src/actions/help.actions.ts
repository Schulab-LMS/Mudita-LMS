"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth-helpers";
import { rateLimit, HELP_FEEDBACK_RATE_LIMIT } from "@/lib/rate-limit";
import {
  createHelpArticleSchema,
  updateHelpArticleSchema,
  deleteHelpArticleSchema,
  helpFeedbackSchema,
  helpSearchLogSchema,
  type CreateHelpArticleInput,
} from "@/validators/help.schema";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createHelpArticle(data: CreateHelpArticleInput) {
  try {
    await requireAdmin();
    const parsed = createHelpArticleSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const slug = slugify(parsed.data.title);
    const existing = await db.helpArticle.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "An article with this slug already exists" };
    }

    const article = await db.helpArticle.create({
      data: {
        slug,
        category: parsed.data.category,
        title: parsed.data.title,
        titleAr: parsed.data.titleAr || null,
        titleDe: parsed.data.titleDe || null,
        excerpt: parsed.data.excerpt,
        excerptAr: parsed.data.excerptAr || null,
        excerptDe: parsed.data.excerptDe || null,
        content: parsed.data.content,
        contentAr: parsed.data.contentAr || null,
        contentDe: parsed.data.contentDe || null,
        tags: parsed.data.tags,
        order: parsed.data.order,
        isPublished: parsed.data.isPublished,
        isFeatured: parsed.data.isFeatured,
      },
    });

    revalidatePath("/admin/help");
    revalidatePath("/help");
    return { success: true, articleId: article.id };
  } catch (error) {
    console.error("createHelpArticle error:", error);
    return { success: false, error: "Failed to create article" };
  }
}

export async function updateHelpArticle(
  articleId: string,
  data: CreateHelpArticleInput
) {
  try {
    await requireAdmin();
    const parsed = updateHelpArticleSchema.safeParse({ articleId, data });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const slug = slugify(parsed.data.data.title);
    const existing = await db.helpArticle.findUnique({ where: { slug } });
    if (existing && existing.id !== parsed.data.articleId) {
      return { success: false, error: "An article with this slug already exists" };
    }

    await db.helpArticle.update({
      where: { id: parsed.data.articleId },
      data: {
        slug,
        category: parsed.data.data.category,
        title: parsed.data.data.title,
        titleAr: parsed.data.data.titleAr || null,
        titleDe: parsed.data.data.titleDe || null,
        excerpt: parsed.data.data.excerpt,
        excerptAr: parsed.data.data.excerptAr || null,
        excerptDe: parsed.data.data.excerptDe || null,
        content: parsed.data.data.content,
        contentAr: parsed.data.data.contentAr || null,
        contentDe: parsed.data.data.contentDe || null,
        tags: parsed.data.data.tags,
        order: parsed.data.data.order,
        isPublished: parsed.data.data.isPublished,
        isFeatured: parsed.data.data.isFeatured,
      },
    });

    revalidatePath("/admin/help");
    revalidatePath("/help");
    revalidatePath(`/help/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("updateHelpArticle error:", error);
    return { success: false, error: "Failed to update article" };
  }
}

export async function deleteHelpArticle(articleId: string) {
  try {
    await requireAdmin();
    const parsed = deleteHelpArticleSchema.safeParse({ articleId });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const article = await db.helpArticle.findUnique({
      where: { id: parsed.data.articleId },
      select: { slug: true },
    });
    if (!article) return { success: false, error: "Article not found" };

    await db.helpArticle.delete({ where: { id: parsed.data.articleId } });

    revalidatePath("/admin/help");
    revalidatePath("/help");
    revalidatePath(`/help/${article.slug}`);
    return { success: true };
  } catch (error) {
    console.error("deleteHelpArticle error:", error);
    return { success: false, error: "Failed to delete article" };
  }
}

export async function toggleHelpArticlePublish(articleId: string) {
  try {
    await requireAdmin();
    const article = await db.helpArticle.findUnique({
      where: { id: articleId },
      select: { isPublished: true, slug: true },
    });
    if (!article) return { success: false, error: "Article not found" };

    await db.helpArticle.update({
      where: { id: articleId },
      data: { isPublished: !article.isPublished },
    });

    revalidatePath("/admin/help");
    revalidatePath("/help");
    revalidatePath(`/help/${article.slug}`);
    return { success: true, isPublished: !article.isPublished };
  } catch (error) {
    console.error("toggleHelpArticlePublish error:", error);
    return { success: false, error: "Failed to toggle publish status" };
  }
}

export async function submitHelpFeedback(data: {
  articleId: string;
  helpful: boolean;
}) {
  try {
    const parsed = helpFeedbackSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Rate-limit per (user|anon, article). Anonymous traffic shares a
    // single bucket per article, so spam is bounded even without auth.
    const session = await auth();
    const identity = session?.user?.id ?? "anon";
    const limit = rateLimit(
      `help-feedback:${identity}:${parsed.data.articleId}`,
      HELP_FEEDBACK_RATE_LIMIT
    );
    if (!limit.success) {
      return { success: false, error: "Too many submissions. Please slow down." };
    }

    await db.helpFeedback.create({
      data: {
        articleId: parsed.data.articleId,
        helpful: parsed.data.helpful,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("submitHelpFeedback error:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

export async function logHelpSearch(data: {
  query: string;
  resultsCount: number;
  locale: string;
}) {
  try {
    const parsed = helpSearchLogSchema.safeParse(data);
    if (!parsed.success) return;

    await db.helpSearchLog.create({
      data: {
        query: parsed.data.query,
        resultsCount: parsed.data.resultsCount,
        locale: parsed.data.locale,
      },
    });
  } catch {
    // Fire-and-forget analytics, swallow errors
  }
}
