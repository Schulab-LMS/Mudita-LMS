import { db } from "@/lib/db";

export type CreateBookingError = "invalid_range" | "conflict" | "server_error";

export async function createBooking(data: {
  studentId: string;
  tutorId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  price: number;
}) {
  if (
    !(data.startTime instanceof Date) ||
    !(data.endTime instanceof Date) ||
    data.endTime <= data.startTime
  ) {
    return { error: "invalid_range" as const };
  }
  if (data.startTime.getTime() < Date.now()) {
    return { error: "invalid_range" as const };
  }

  try {
    // Run the overlap check and the insert in a single transaction so two
    // concurrent bookings for the same tutor cannot both pass the check.
    return await db.$transaction(async (tx) => {
      const overlap = await tx.booking.findFirst({
        where: {
          tutorId: data.tutorId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: data.endTime },
          endTime: { gt: data.startTime },
        },
        select: { id: true },
      });
      if (overlap) return { error: "conflict" as const };

      const booking = await tx.booking.create({
        data: {
          ...data,
          price: data.price,
          status: "PENDING",
        },
      });
      return { booking };
    });
  } catch (err) {
    console.error("createBooking error:", err);
    return { error: "server_error" as const };
  }
}

export async function getBookingsForStudent(studentId: string) {
  try {
    return await db.booking.findMany({
      where: { studentId },
      include: {
        tutor: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
      orderBy: { startTime: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getBookingsForTutor(tutorId: string) {
  try {
    return await db.booking.findMany({
      where: { tutorId },
      include: {
        student: { select: { name: true, avatar: true, email: true } },
      },
      orderBy: { startTime: "desc" },
    });
  } catch {
    return [];
  }
}

/**
 * Cancel a booking. Requires the caller to be either the student who
 * created the booking or the tutor whose profile owns it. Returns the
 * updated booking, or `null` when the caller is not authorised, the
 * booking does not exist, or it is already in a terminal state.
 */
export async function cancelBooking(bookingId: string, userId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        studentId: true,
        status: true,
        tutor: { select: { userId: true } },
      },
    });
    if (!booking) return null;

    const isStudent = booking.studentId === userId;
    const isOwningTutor = booking.tutor.userId === userId;
    if (!isStudent && !isOwningTutor) return null;

    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return null;
    }

    return await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  } catch {
    return null;
  }
}

export async function getAvailableSlots(tutorId: string, date: Date) {
  try {
    const dayOfWeek = date.getDay();
    const availability = await db.tutorAvailability.findMany({
      where: { tutorId, dayOfWeek },
    });

    // Build the day window without mutating the caller's `date` object —
    // calling `date.setHours` directly would have shifted it forward to the
    // end of the day, so subsequent reads of `date` (or any caller holding a
    // reference) would see the wrong value.
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await db.booking.findMany({
      where: {
        tutorId,
        startTime: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    // Generate 1-hour slots from availability, minus booked slots
    const slots: { startTime: string; endTime: string; available: boolean }[] = [];
    for (const avail of availability) {
      const [startH] = avail.startTime.split(":").map(Number);
      const [endH] = avail.endTime.split(":").map(Number);
      for (let h = startH; h < endH; h++) {
        const slotStart = `${String(h).padStart(2, "0")}:00`;
        const slotEnd = `${String(h + 1).padStart(2, "0")}:00`;
        const isBooked = existingBookings.some((b) => {
          const bh = b.startTime.getHours();
          return bh === h;
        });
        slots.push({ startTime: slotStart, endTime: slotEnd, available: !isBooked });
      }
    }
    return slots;
  } catch {
    return [];
  }
}
