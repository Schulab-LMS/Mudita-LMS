import { redirect } from "next/navigation";
import { getViewContext } from "@/lib/view-as.server";

// Centralised tutor gate, on the EFFECTIVE role: a real tutor, or an admin
// previewing as TUTOR, may enter; everyone else is redirected. Replaces the
// per-page `role !== "TUTOR"` checks (which used the real role and would fight
// the preview overlay).
export default async function TutorSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, effectiveRole } = await getViewContext();
  if (!session?.user) redirect("/login");
  if (effectiveRole !== "TUTOR") redirect("/dashboard");
  return <>{children}</>;
}
