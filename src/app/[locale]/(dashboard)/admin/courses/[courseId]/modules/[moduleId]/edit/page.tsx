import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ModuleEditForm } from "./module-edit-form";
import { PageHeader } from "@/components/ui/page-header";
import { Pencil } from "lucide-react";

export const metadata = { title: "Edit Module | Admin" };

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const { courseId, moduleId } = await params;

  const [course, mod] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    }),
    db.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        titleAr: true,
        titleDe: true,
        order: true,
        courseId: true,
      },
    }),
  ]);

  if (!course || !mod || mod.courseId !== courseId) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit module"
        description={`Update title and translations for "${mod.title}".`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Courses", href: "/admin/courses" },
          { label: course.title, href: `/admin/courses/${courseId}` },
          { label: mod.title },
        ]}
        icon={<Pencil className="h-5 w-5" />}
      />
      <div className="card-premium p-6">
        <ModuleEditForm
          courseId={courseId}
          module={{
            id: mod.id,
            title: mod.title,
            titleAr: mod.titleAr ?? "",
            titleDe: mod.titleDe ?? "",
            order: mod.order,
          }}
        />
      </div>
    </div>
  );
}
