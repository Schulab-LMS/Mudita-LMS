"use client";

import { useState } from "react";
import { createBooking } from "@/actions/booking.actions";

interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingFormProps {
  tutorId: string;
  availableSlots?: AvailableSlot[];
  hourlyRate?: number;
}

export function BookingForm({ tutorId, availableSlots = [], hourlyRate = 50 }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const subject = fd.get("subject") as string;
    const date = fd.get("date") as string;
    const timeSlot = fd.get("timeSlot") as string;
    const notes = fd.get("notes") as string;

    if (!date || !timeSlot) {
      setError("Please select a date and time slot.");
      setLoading(false);
      return;
    }

    const [startH, endH] = timeSlot.split("-");
    const startTime = new Date(`${date}T${startH}:00`);
    const endTime = new Date(`${date}T${endH}:00`);

    const result = await createBooking({
      tutorId,
      subject,
      startTime,
      endTime,
      notes: notes || undefined,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Failed to create booking");
    } else {
      setSuccess(true);
      form.reset();
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-5 text-center">
        <p className="text-xl">🎉</p>
        <p className="mt-2 font-semibold text-green-800">Booking request sent!</p>
        <p className="mt-1 text-sm text-green-700">
          The tutor will confirm your session shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
        >
          Book another session
        </button>
      </div>
    );
  }

  const availableSlotOptions = availableSlots.filter((s) => s.available);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Subject</label>
        <input
          name="subject"
          required
          placeholder="e.g., Mathematics, Science"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Date</label>
        <input
          name="date"
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">Time Slot</label>
        {availableSlotOptions.length > 0 ? (
          <select
            name="timeSlot"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a time slot</option>
            {availableSlotOptions.map((slot) => (
              <option
                key={slot.startTime}
                value={`${slot.startTime}-${slot.endTime}`}
              >
                {slot.startTime} – {slot.endTime}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="timeSlot"
            type="time"
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="09:00-10:00"
          />
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Notes <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Any specific topics or goals for the session?"
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="rounded-lg bg-muted px-4 py-3 text-sm">
        <span className="text-muted-foreground">Session price: </span>
        <span className="font-semibold">${hourlyRate}/hr</span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Booking…" : "Request Session"}
      </button>
    </form>
  );
}
