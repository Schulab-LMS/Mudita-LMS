import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPathwayBySlug,
  getPathwayProgress,
  getLocalizedField,
} from "@/services/pathway.service";
import { auth } from "@/lib/auth";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  PathwayRoadmap,
  type RoadmapStage,
} from "@/components/pathway/pathway-roadmap";
import { ageGroupLabels } from "@/components/course/catalog-labels";
import { Map as MapIcon, Milestone } from "lucide-react";

interface PathwayDetailPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: PathwayDetailPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const pathway = await getPathwayBySlug(slug);
  if (!pathway) return { title: "Pathway Not Found" };
  return {
    title: `${getLocalizedField(pathway, "title", locale)} | Schulab`,
    description: getLocalizedField(pathway, "description", locale),
  };
}

export default async function PathwayDetailPage({
  params,
}: PathwayDetailPageProps) {
  const { slug, locale } = await params;
  const [pathway, session] = await Promise.all([getPathwayBySlug(slug), auth()]);

  if (!pathway) notFound();

  const title = getLocalizedField(pathway, "title", locale);
  const description = getLocalizedField(pathway, "description", locale);

  const progress = session?.user?.id
    ? await getPathwayProgress(session.user.id, pathway)
    : null;

  // Flatten stages into roadmap nodes, localizing the bundle/course title.
  const stages: RoadmapStage[] = pathway.stages.map((stage, i) => {
    const stageLabel = getLocalizedField(stage, "title", locale);
    if (stage.bundle) {
      return {
        key: stage.id,
        label: stageLabel,
        kind: "bundle",
        href: `/bundles/${stage.bundle.slug}`,
        targetTitle: getLocalizedField(stage.bundle, "title", locale),
        done: progress?.stageDone[i] ?? false,
      };
    }
    return {
      key: stage.id,
      label: stageLabel,
      kind: "course",
      href: stage.course ? `/courses/${stage.course.slug}` : "#",
      targetTitle: stage.course
        ? getLocalizedField(stage.course, "title", locale)
        : "",
      done: progress?.stageDone[i] ?? false,
    };
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[{ label: "Pathways", href: "/pathways" }, { label: title }]}
      />

      {/* Header */}
      <div className="mt-4 rounded-3xl border border-border bg-launch-gradient-soft p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold shadow-sm">
          <MapIcon className="h-3.5 w-3.5 text-accent" aria-hidden />
          Pathway · {ageGroupLabels[pathway.ageGroup] ?? pathway.ageGroup}
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="chip chip-neutral inline-flex items-center gap-1">
            <Milestone className="h-3.5 w-3.5" />
            {pathway.stages.length} {pathway.stages.length === 1 ? "stage" : "stages"}
          </span>
        </div>

        {progress && (
          <div className="mt-6 max-w-md">
            <div className="mb-1 flex items-center justify-between text-sm font-medium">
              <span>Your journey</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-launch-gradient transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {progress.completedStages} of {progress.totalStages} stages completed
            </p>
          </div>
        )}
      </div>

      {/* Roadmap */}
      <div className="mt-8">
        <h2 className="mb-5 font-display text-2xl font-bold">Your roadmap</h2>
        {stages.length === 0 ? (
          <p className="text-muted-foreground">This pathway has no stages yet.</p>
        ) : (
          <PathwayRoadmap stages={stages} />
        )}
      </div>
    </div>
  );
}
