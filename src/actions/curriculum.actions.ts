"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { audit } from "@/lib/audit";
import { runCurriculumSync } from "@/services/curriculum-sync.service";

// Admin-triggered full resync of the curriculum repo. Forces past the
// "no new commit" short-circuit so an admin can always pull the latest HEAD.
export async function resyncCurriculum() {
  try {
    const session = await requireAdmin();
    const result = await runCurriculumSync({ trigger: "MANUAL", force: true });

    await audit({
      actorId: session.user!.id,
      action: "curriculum.resync",
      resource: "CurriculumSyncRun",
      resourceId: result.runId || null,
      metadata: {
        status: result.status,
        coursesUpserted: result.coursesUpserted,
        lessonsUpserted: result.lessonsUpserted,
        coursesArchived: result.coursesArchived,
      },
    });

    revalidatePath("/admin/curriculum");
    revalidatePath("/admin/courses");

    if (result.status === "FAILED") {
      return { success: false, error: result.error || "Sync failed" };
    }
    return { success: true, result };
  } catch (error) {
    console.error("resyncCurriculum error:", error);
    return { success: false, error: "Failed to resync curriculum" };
  }
}
