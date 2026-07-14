"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addChildAccount } from "@/actions/parent.actions";

const addChildFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (value) =>
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        value >= "1900-01-01" &&
        value <= new Date().toISOString().slice(0, 10),
      "Please enter a valid date of birth"
    ),
});

type AddChildFormData = z.infer<typeof addChildFormSchema>;

export function AddChildForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddChildFormData>({
    resolver: zodResolver(addChildFormSchema),
  });

  async function onSubmit(data: AddChildFormData) {
    setLoading(true);
    setError(null);
    const result = await addChildAccount({
      name: data.name,
      email: data.email,
      password: data.password,
      dateOfBirth: data.dateOfBirth,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      reset();
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Child account created successfully! Refresh the page to see the update.
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Add another child
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Full Name</label>
        <input
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "child-name-error" : undefined}
          {...register("name")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Child's full name"
        />
        {errors.name && (
          <p id="child-name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Email Address</label>
        <input
          type="email"
          required
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "child-email-error" : undefined}
          {...register("email")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="child@example.com"
        />
        {errors.email && (
          <p id="child-email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          minLength={8}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "child-password-error" : undefined
          }
          {...register("password")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Minimum 8 characters"
        />
        {errors.password && (
          <p
            id="child-password-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Date of birth</label>
        <input
          type="date"
          required
          max={new Date().toISOString().slice(0, 10)}
          aria-invalid={Boolean(errors.dateOfBirth)}
          aria-describedby={
            errors.dateOfBirth
              ? "child-date-of-birth-error child-date-of-birth-help"
              : "child-date-of-birth-help"
          }
          {...register("dateOfBirth")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.dateOfBirth && (
          <p
            id="child-date-of-birth-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.dateOfBirth.message}
          </p>
        )}
        <p
          id="child-date-of-birth-help"
          className="mt-1 text-xs text-muted-foreground"
        >
          Required to comply with COPPA / GDPR-K. Minors need verified parental
          consent before enrolling.
        </p>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Creating Account…" : "Create Child Account"}
      </button>
    </form>
  );
}
