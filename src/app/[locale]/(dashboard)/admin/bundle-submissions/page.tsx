import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import { BundleSubmissionReview } from "@/components/admin/bundle-submission-review";
import { Inbox } from "lucide-react";

export const metadata = { title: "Capstone Submissions | Admin" };

export default async function AdminBundleSubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const submissions = await db.activitySubmission
    .findMany({
      where: { bundleId: { not: null } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        content: true,
        status: true,
        feedback: true,
        updatedAt: true,
        student: { select: { name: true, email: true } },
        bundle: { select: { title: true } },
      },
    })
    .catch(() => []);

  const pending = submissions.filter((s) => s.status === "SUBMITTED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capstone submissions"
        description={`${submissions.length} submission${submissions.length === 1 ? "" : "s"} · ${pending} awaiting review`}
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Capstones" }]}
        icon={<Inbox className="h-5 w-5" />}
      />

      {submissions.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No capstone submissions yet"
          description="When students submit a bundle's final project, it will appear here for review."
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="card-premium space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{s.bundle?.title ?? "Bundle"}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.student.name} · {s.student.email}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${s.status === "REVIEWED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {s.status === "REVIEWED" ? "Reviewed" : "Awaiting review"}
                </span>
              </div>

              <div className="rounded-lg bg-muted/50 p-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">{s.content}</p>
              </div>

              <BundleSubmissionReview submissionId={s.id} existingFeedback={s.feedback} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
