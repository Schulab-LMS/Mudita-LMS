import { redirect } from "next/navigation";
import { getViewContext } from "@/lib/view-as.server";

// Centralised parent gate, on the EFFECTIVE role: a real parent, or an admin
// previewing as PARENT, may enter; everyone else is redirected. Replaces the
// per-page `role !== "PARENT"` checks.
export default async function ParentSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, effectiveRole } = await getViewContext();
  if (!session?.user) redirect("/login");
  if (effectiveRole !== "PARENT") redirect("/dashboard");
  return <>{children}</>;
}
