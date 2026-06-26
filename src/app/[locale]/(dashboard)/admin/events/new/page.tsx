import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import EventForm from "@/components/admin/event-form";
import { PageHeader } from "@/components/ui/page-header";
import { Sparkles } from "lucide-react";

export const metadata = { title: "New Event | Admin" };

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const pathways = await db.learningPathway
    .findMany({ select: { id: true, title: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="New event"
        description="Add a reputable external STEM event to the catalog."
        icon={<Sparkles className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Events & Competitions", href: "/admin/events" },
          { label: "New" },
        ]}
      />
      <div className="card-premium p-6">
        <EventForm mode="create" pathways={pathways} />
      </div>
    </div>
  );
}
