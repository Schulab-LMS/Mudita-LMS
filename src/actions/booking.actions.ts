"use server";

import { auth } from "@/lib/auth";
import { createBooking as createBookingService, cancelBooking as cancelBookingService } from "@/services/booking.service";
import { createBookingSchema, cancelBookingSchema } from "@/validators/action.schemas";

export async function createBooking(data: {
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  price: number;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = createBookingSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const result = await createBookingService({
    studentId: session.user.id,
    ...parsed.data,
  });

  if ("error" in result) {
    switch (result.error) {
      case "invalid_range":
        return { error: "Pick a valid future time slot" };
      case "conflict":
        return { error: "That time slot is no longer available" };
      default:
        return { error: "Failed to create booking" };
    }
  }
  return { success: true, bookingId: result.booking.id };
}

export async function cancelBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = cancelBookingSchema.safeParse({ bookingId });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const result = await cancelBookingService(parsed.data.bookingId, session.user.id);
  if (!result) return { error: "Unable to cancel this booking" };
  return { success: true };
}
