import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import {
  PathwayStageBuilder,
  type StageRow,
} from "@/components/admin/pathway-stage-builder";
import { Milestone } from "lucide-react";

export const metadata = { title: "Manage Pathway Stages | Admin" };

interface PathwayStagesPageProps {
  params: Promise<{ pathwayId: string }>;
}

export default async function PathwayStagesPage({ params }: PathwayStagesPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { pathwayId } = await params;
  const [pathway, bundles, courses] = await Promise.all([
    db.learningPathway
      .findUnique({
        where: { id: pathwayId },
        select: {
          id: true,
          title: true,
          stages: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              bundle: { select: { title: true } },
              course: { select: { title: true } },
            },
          },
        },
      })
      .catch(() => null),
    db.bundle.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }).catch(() => []),
    db.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }).catch(() => []),
  ]);

  if (!pathway) notFound();

  const stages: StageRow[] = pathway.stages.map((s) => ({
    id: s.id,
    kind: s.bundle ? "bundle" : "course",
    targetTitle: s.bundle?.title ?? s.course?.title ?? "(missing)",
    title: s.title,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Manage stages"
        description={`Stages in "${pathway.title}" — each stage is one bundle or one course.`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pathways", href: "/admin/pathways" },
          { label: pathway.title, href: `/admin/pathways/${pathway.id}/edit` },
          { label: "Stages" },
        ]}
        icon={<Milestone className="h-5 w-5" />}
      />
      <PathwayStageBuilder
        pathwayId={pathway.id}
        stages={stages}
        bundles={bundles}
        courses={courses}
      />
    </div>
  );
}
