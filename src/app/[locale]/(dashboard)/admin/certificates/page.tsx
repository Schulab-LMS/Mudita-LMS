import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NoCoursesScene } from "@/components/illustrations/empty-scenes";
import {
  RevokeCertificateButton,
  IssueCertificateForm,
} from "./certificate-actions";
import {
  GraduationCap,
  ExternalLink,
  Award,
  Download,
  ShieldCheck,
} from "lucide-react";

export const metadata = { title: "Manage Certificates | Admin" };

export default async function AdminCertificatesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  const certificates = await db.certificate
    .findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { issuedAt: "desc" },
    })
    .catch(() => []);

  // Fetch course info separately since Certificate model doesn't have a course relation
  const courseIds = [...new Set(certificates.map((c) => c.courseId))];
  const courses = await db.course
    .findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true, slug: true },
    })
    .catch(() => []);
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Metrics
  const uniqueStudents = new Set(certificates.map((c) => c.user.id)).size;
  const uniqueCourses = courseIds.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description={`${certificates.length} certificate${
          certificates.length === 1 ? "" : "s"
        } issued · ${uniqueStudents} student${
          uniqueStudents === 1 ? "" : "s"
        } · ${uniqueCourses} course${uniqueCourses === 1 ? "" : "s"}`}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Certificates" },
        ]}
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryTile
          label="Issued"
          value={certificates.length}
          icon={<Award className="h-4 w-4" />}
          tone="primary"
        />
        <SummaryTile
          label="Unique students"
          value={uniqueStudents}
          icon={<GraduationCap className="h-4 w-4" />}
          tone="secondary"
        />
        <SummaryTile
          label="Courses"
          value={uniqueCourses}
          icon={<ShieldCheck className="h-4 w-4" />}
          tone="success"
        />
      </div>

      {/* Manual issue form */}
      <div className="card-premium p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Issue certificate manually
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Award a completion certificate directly. The student will get an
              email with the verification link.
            </p>
          </div>
        </div>
        <IssueCertificateForm />
      </div>

      {/* Certificates table */}
      {certificates.length === 0 ? (
        <EmptyState
          illustration={<NoCoursesScene />}
          title="No certificates issued yet"
          description="When students complete a course, their certificate will appear here. You can also issue one manually above."
          tone="first-use"
          size="lg"
        />
      ) : (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Student
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Course
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Code
                  </th>
                  <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Issued
                  </th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Links
                  </th>
                  <th className="px-5 py-3 text-end text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => {
                  const course = courseMap.get(cert.courseId);
                  return (
                    <tr
                      key={cert.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">
                          {cert.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cert.user.email}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">
                        {course?.title || (
                          <span className="text-muted-foreground italic">
                            Unknown course
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">
                          {cert.code}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {dateFmt.format(new Date(cert.issuedAt))}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <a
                            href={`/api/certificates/${cert.code}/download`}
                            target="_blank"
                            title="Download PDF"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Download className="h-4 w-4" aria-hidden />
                          </a>
                          <a
                            href={`/verify/${cert.code}`}
                            target="_blank"
                            title="Verify publicly"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden />
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-end">
                        <RevokeCertificateButton certificateId={cert.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "primary" | "secondary" | "success";
}) {
  const toneClasses: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="card-premium p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
