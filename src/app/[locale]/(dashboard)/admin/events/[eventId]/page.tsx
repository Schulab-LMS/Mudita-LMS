import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { getEventById } from "@/services/event.service";
import EventForm from "@/components/admin/event-form";
import { EventRecommendationsManager } from "@/components/admin/event-recommendations-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Edit Event | Admin" };

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { eventId } = await params;
  const [event, pathways, courses, bundles] = await Promise.all([
    getEventById(eventId),
    db.learningPathway.findMany({ select: { id: true, title: true }, orderBy: { order: "asc" } }).catch(() => []),
    db.course
      .findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true }, orderBy: { title: "asc" } })
      .catch(() => []),
    db.bundle.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }).catch(() => []),
  ]);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={event.title}
        description="Edit event metadata and manage preparation recommendations."
        icon={<Sparkles className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Events & Competitions", href: "/admin/events" },
          { label: "Edit" },
        ]}
      />

      <div className="card-premium p-6">
        <EventForm
          mode="edit"
          pathways={pathways}
          initialData={{
            id: event.id,
            name: event.title,
            description: event.description,
            officialProvider: event.officialProvider ?? "",
            officialUrl: event.officialUrl ?? "",
            eventType: event.eventType ?? "",
            category: event.category,
            region: event.region ?? "GLOBAL",
            tracks: event.tracks,
            ageGroup: event.ageGroup,
            ageMin: event.ageMin ?? 0,
            ageMax: event.ageMax ?? 0,
            levelMin: event.levelMin ?? "BEGINNER",
            levelMax: event.levelMax ?? "ADVANCED",
            seasonMonths: event.seasonMonths,
            listingStatus: event.listingStatus,
            preparationPathId: event.preparationPathId,
          }}
        />
      </div>

      <div className="card-premium p-6">
        <h2 className="font-display text-lg font-bold">Preparation recommendations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Map the SchuLab courses and bundles that prepare a learner for this event.
        </p>
        <EventRecommendationsManager
          eventId={event.id}
          courseRecs={event.courseRecommendations.map((r) => ({
            id: r.id,
            title: r.course.title,
            type: r.recommendationType,
            reason: r.reason,
          }))}
          bundleRecs={event.bundleRecommendations.map((r) => ({
            id: r.id,
            title: r.bundle.title,
            type: r.recommendationType,
            reason: r.reason,
          }))}
          courses={courses}
          bundles={bundles}
        />
      </div>
    </div>
  );
}
