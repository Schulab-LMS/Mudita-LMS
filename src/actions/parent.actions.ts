"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { addChildAccountSchema, removeChildSchema } from "@/validators/action.schemas";

export async function addChildAccount(data: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }
    if (session.user.role !== "PARENT") {
      return { success: false, error: "Only parents can add child accounts" };
    }

    const parsed = addChildAccountSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const email = parsed.data.email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const parentId = session.user.id;

    // Create the child user and link them to the parent atomically so we
    // never leave an orphaned child account if the link insert fails.
    const child = await db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email,
          passwordHash,
          role: "STUDENT",
        },
      });
      await tx.parentChild.create({
        data: { parentId, childId: created.id },
      });
      return created;
    });

    return { success: true, data: { childId: child.id } };
  } catch (error) {
    console.error("addChildAccount action error:", error);
    return { success: false, error: "Failed to add child account" };
  }
}

export async function removeChild(childId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const parsed = removeChildSchema.safeParse({ childId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.parentChild.delete({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId: parsed.data.childId,
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("removeChild action error:", error);
    return { success: false, error: "Failed to remove child" };
  }
}
