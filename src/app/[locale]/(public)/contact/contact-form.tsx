"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { submitContactForm } from "@/actions/contact.actions";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: searchParams.get("subject") ?? "",
      message: searchParams.get("message") ?? "",
    },
  });

  async function onSubmit(data: ContactFormData) {
    setSubmitError(null);
    const result = await submitContactForm(data);
    if (result.success) {
      setSent(true);
    } else {
      setSubmitError(result.error || "Something went wrong");
    }
  }

  if (sent) {
    return (
      <div className="mt-12 mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#34d399]/15">
          <CheckCircle className="h-10 w-10 text-[#34d399]" />
        </div>
        <h2 className="mt-5 font-display text-xl font-semibold">Message sent!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for reaching out. We&apos;ll get back to you soon.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.name")}</Label>
          <Input
            id="name"
            placeholder={t("form.namePlaceholder")}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("form.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("form.emailPlaceholder")}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{t("form.subject")}</Label>
        <Input
          id="subject"
          placeholder={t("form.subjectPlaceholder")}
          {...register("subject")}
        />
        {errors.subject && (
          <p className="text-sm text-destructive">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t("form.message")}</Label>
        <textarea
          id="message"
          rows={5}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={t("form.messagePlaceholder")}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-sm text-destructive">
            {errors.message.message}
          </p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Button type="submit" variant="launch" size="lg" disabled={isSubmitting}>
        {isSubmitting ? t("form.sending") : t("form.submit")}
      </Button>
    </form>
  );
}
