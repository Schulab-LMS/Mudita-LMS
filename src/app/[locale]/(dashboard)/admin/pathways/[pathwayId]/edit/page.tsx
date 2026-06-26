import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import PathwayForm from "@/components/admin/pathway-form";
import { PageHeader } from "@/components/ui/page-header";
import { Map as MapIcon, Milestone } from "lucide-react";

export const metadata = { title: "Edit Pathway | Admin" };

interface EditPathwayPageProps {
  params: Promise<{ pathwayId: string }>;
}

export default async function EditPathwayPage({ params }: EditPathwayPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { pathwayId } = await params;
  const pathway = await db.learningPathway
    .findUnique({
      where: { id: pathwayId },
      select: {
        id: true,
        title: true,
        description: true,
        ageGroup: true,
        order: true,
        status: true,
        thumbnail: true,
      },
    })
    .catch(() => null);

  if (!pathway) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit pathway"
        description={`Update "${pathway.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pathways", href: "/admin/pathways" },
          { label: pathway.title },
        ]}
        icon={<MapIcon className="h-5 w-5" />}
        actions={
          <Link
            href={`/admin/pathways/${pathway.id}/stages`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input px-3 text-xs font-semibold transition-colors hover:bg-muted"
          >
            <Milestone className="h-3.5 w-3.5" /> Manage stages
          </Link>
        }
      />
      <PathwayForm
        mode="edit"
        initialData={{
          id: pathway.id,
          title: pathway.title,
          description: pathway.description,
          ageGroup: pathway.ageGroup,
          order: pathway.order,
          status: pathway.status,
          thumbnail: pathway.thumbnail,
        }}
      />
    </div>
  );
}
