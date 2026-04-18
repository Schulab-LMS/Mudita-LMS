import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/services/page.service";
import { getLocalizedField } from "@/services/course.service";
import { sanitize } from "@/lib/sanitize";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = await getPageBySlug(slug);
  if (!page || !page.isPublished) return { title: "Page Not Found" };

  const title = getLocalizedField(page, "title", locale);
  return {
    title: `${title} | Schulab`,
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug, locale } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.isPublished) notFound();

  const title = getLocalizedField(page, "title", locale);
  const content = getLocalizedField(page, "content", locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
        {title}
      </h1>
      <div
        className="prose prose-lg mt-8 max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: sanitize(content) }}
      />
    </div>
  );
}
