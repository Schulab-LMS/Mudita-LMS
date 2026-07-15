import { redirect } from "next/navigation";
import { getViewContext } from "@/lib/view-as.server";

// Centralised student gate, on the EFFECTIVE role: a real student, or an admin
// previewing as STUDENT, may enter; everyone else is redirected. The other
// dashboard segments (admin/tutor/parent) already have this guard; without it
// the /student area only checked authentication (not role), so any signed-in
// user reached the student dashboard and an unauthenticated hit rendered the
// shell with a null session instead of redirecting cleanly.
export default async function StudentSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, effectiveRole } = await getViewContext();
  if (!session?.user) redirect("/login");
  if (effectiveRole !== "STUDENT") redirect("/dashboard");
  return <>{children}</>;
}
