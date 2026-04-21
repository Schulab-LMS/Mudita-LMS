"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sendContactFormEmail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});

const CONTACT_RATE_LIMIT = { maxRequests: 3, windowSeconds: 300 };

export async function submitContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const rl = await rateLimit(`contact:${parsed.data.email}`, CONTACT_RATE_LIMIT);
  if (!rl.success) {
    return { success: false, error: "Too many submissions. Please try again later." };
  }

  try {
    // Store as notification to all admins
    const admins = await db.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true },
    });

    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: `Contact: ${parsed.data.subject}`,
          body: `From ${parsed.data.name} (${parsed.data.email}):\n${parsed.data.message}`,
          type: "CONTACT_FORM",
        })),
      });
    }

    // Send email notification (non-blocking)
    sendContactFormEmail(
      parsed.data.name,
      parsed.data.email,
      parsed.data.subject,
      parsed.data.message
    ).catch(() => null);

    return { success: true };
  } catch (error) {
    console.error("submitContactForm error:", error);
    return { success: false, error: "Failed to submit. Please try again." };
  }
}
