import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChildren } from "@/services/user.service";
import { getUserEnrollments } from "@/services/enrollment.service";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ChildDetailPageProps {
  params: Promise<{ childId: string }>;
}

export default async function ChildDetailPage({ params }: ChildDetailPageProps) {
  const { childId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const children = await getChildren(session.user.id);
  const child = children.find((c) => c.id === childId);
  if (!child) notFound();

  const enrollments = await getUserEnrollments(childId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/parent"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{child.name}&apos;s Progress</h1>
        <p className="text-muted-foreground">
          {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {enrollments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No courses enrolled yet.
        </p>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="rounded-xl border bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">{enrollment.course.title}</h3>
                <Badge
                  variant={enrollment.status === "COMPLETED" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {enrollment.status === "COMPLETED" ? "Completed" : "In progress"}
                </Badge>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {enrollment.progress}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
