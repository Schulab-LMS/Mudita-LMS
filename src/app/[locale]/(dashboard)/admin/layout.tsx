import { redirect } from "next/navigation";
import { isAdminRole } from "@/lib/auth-helpers";
import { getViewContext } from "@/lib/view-as.server";

// Centralised admin gate. Guards on the EFFECTIVE role so that while an admin is
// previewing as a non-admin role the whole /admin tree redirects away — keeping
// the preview illusion intact without editing each admin page. Real-role admins
// (not previewing) pass straight through.
export default async function AdminSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, effectiveRole } = await getViewContext();
  if (!session?.user) redirect("/login");
  if (!isAdminRole(effectiveRole)) redirect("/dashboard");
  return <>{children}</>;
}
