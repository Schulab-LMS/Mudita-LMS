"use client";

import { useCallback, useEffect, useState } from "react";
import { X, BookOpen } from "lucide-react";
import { useHelpStore } from "@/stores/help-store";
import { HelpSearch } from "@/components/help/help-search";
import { HelpArticleCard } from "@/components/help/help-article-card";
import { HelpArticleView } from "@/components/help/help-article-view";
import { CATEGORY_CONFIG, getCategoryLabel, CATEGORIES } from "@/components/help/category-config";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Article {
  id: string;
  slug: string;
  category: string;
  title: string;
  titleAr?: string | null;
  titleDe?: string | null;
  excerpt: string;
  excerptAr?: string | null;
  excerptDe?: string | null;
  content?: string;
  contentAr?: string | null;
  contentDe?: string | null;
  tags?: string[];
  isFeatured?: boolean;
  updatedAt?: Date | string;
}

interface HelpPanelProps {
  articles: Article[];
}

export function HelpPanel({ articles }: HelpPanelProps) {
  const { isOpen, closeHelp } = useHelpStore();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const locale = useLocale();

  // Single close handler — resets local state and then closes the panel via
  // the store. Wrapping closeHelp this way means we never have to reset state
  // from inside an effect (which would force an extra render after unmount-
  // animation completes).
  const handleClose = useCallback(() => {
    setSelectedArticle(null);
    setActiveCategory("ALL");
    closeHelp();
  }, [closeHelp]);

  // Close panel on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredArticles =
    activeCategory === "ALL"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const usedCategories = CATEGORIES.filter((cat) =>
    articles.some((a) => a.category === cat)
  );

  function handleArticleSelect(article: Article) {
    // Find full article data if available
    const full = articles.find((a) => a.id === article.id);
    setSelectedArticle(full ?? article);
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Help Center"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold text-foreground">Help Center</span>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close Help Center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b px-5 py-3">
          <HelpSearch
            autoFocus={isOpen}
            placeholder="Search for help..."
            onSelect={(article) => handleArticleSelect(article as Article)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedArticle ? (
            <div className="px-5 py-4">
              <HelpArticleView
                article={{
                  ...selectedArticle,
                  content: selectedArticle.content ?? "",
                  tags: selectedArticle.tags ?? [],
                  updatedAt: selectedArticle.updatedAt ?? new Date(),
                }}
                onBack={() => setSelectedArticle(null)}
              />
            </div>
          ) : (
            <>
              {/* Category tabs */}
              <div className="flex gap-1 overflow-x-auto border-b px-5 py-2 scrollbar-none">
                <button
                  onClick={() => setActiveCategory("ALL")}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeCategory === "ALL"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  All
                </button>
                {usedCategories.map((cat) => {
                  const config = CATEGORY_CONFIG[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span>{config?.icon}</span>
                      {getCategoryLabel(cat, locale)}
                    </button>
                  );
                })}
              </div>

              {/* Articles list */}
              <div className="flex flex-col gap-2 p-5">
                {filteredArticles.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No articles in this category yet.
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <HelpArticleCard
                      key={article.id}
                      article={article}
                      onClick={handleArticleSelect}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-3">
          <Link
            href="/help"
            onClick={handleClose}
            className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline"
          >
            <BookOpen className="h-3.5 w-3.5" />
            View Full Help Center
          </Link>
        </div>
      </div>
    </>
  );
}
