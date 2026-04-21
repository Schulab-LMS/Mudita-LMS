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
import { Mail, Phone, MapPin, CheckCircle, Sparkles } from "lucide-react";
import { submitContactForm } from "@/actions/contact.actions";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
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

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-orange-50 py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#4f3ff0] opacity-[0.05] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#ff8a3d] opacity-[0.05] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
            <Sparkles className="h-4 w-4 text-[var(--stem-rocket)]" />
            <span className="text-launch-gradient">Get in touch</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        {sent ? (
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
        ) : (
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
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
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover-lift">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4f3ff0]/10">
                <Mail className="h-5 w-5 text-[#4f3ff0]" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{t("info.emailTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("info.email")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover-lift">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10">
                <Phone className="h-5 w-5 text-[#8b5cf6]" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{t("info.phoneTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("info.phone")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-all hover-lift">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff8a3d]/10">
                <MapPin className="h-5 w-5 text-[#ff8a3d]" />
              </div>
              <div>
                <h3 className="font-display font-semibold">{t("info.addressTitle")}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("info.address")}
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
