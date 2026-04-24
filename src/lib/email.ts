import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "Schulab <noreply@schulab.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const resend = getResend();

  // If no API key configured, log and return (dev mode)
  if (!resend) {
    console.log(`[Email] To: ${to} | Subject: ${subject}`);
    console.log(`[Email] Would send email. Set RESEND_API_KEY to enable.`);
    return { success: true, dev: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email] Send failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Send error:", err);
    return { success: false, error: "Failed to send email" };
  }
}

// ── Email Templates ─────────────────────────────────────────────────

/**
 * Escape a user-supplied string so it cannot break out of an HTML context
 * inside an email template. Always use this for any value that originated
 * from a user (names, subjects, message bodies, etc.).
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Design tokens ───────────────────────────────────────────────────
// Brand palette mirrors the app's globals.css so email visuals match
// the product. Inlined here because email clients strip <style> blocks
// and don't run JS — every style must ship as an inline attribute.
const BRAND = {
  indigo: "#4F3FF0",
  purple: "#8B5CF6",
  orange: "#FF8A3D",
  ink: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  soft: "#F1F5FF",
  page: "#F4F4F9",
  card: "#FFFFFF",
  success: "#059669",
  danger: "#DC2626",
} as const;

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

// ── Primitives ──────────────────────────────────────────────────────

/**
 * Hidden preview text shown in the inbox row before the user opens the
 * email. Keep it short (≤90 chars) and complementary to the subject.
 * Padded with zero-width joiners so Gmail doesn't pull surrounding HTML
 * into the preview.
 */
function preheader(text: string): string {
  const safe = escapeHtml(text);
  return `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.page};">
    ${safe}${"&#847; ".repeat(80)}
  </div>`;
}

/**
 * Branded header: gradient logo mark + Schulab wordmark. The <img>
 * points at the app's /icon.svg which renders in most modern clients;
 * for clients that strip the image, the surrounding gradient tile plus
 * the wordmark keep the brand recognisable. Outlook needs a table-based
 * layout here — do not inline-flex this.
 */
function brandHeader(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.card};">
    <tr>
      <td align="center" style="padding:28px 32px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="44" style="background-color:${BRAND.indigo};background-image:linear-gradient(135deg,${BRAND.indigo} 0%,${BRAND.purple} 55%,${BRAND.orange} 100%);border-radius:11px;vertical-align:middle;line-height:0;">
              <img src="${APP_URL}/icon.svg" alt="Schulab" width="44" height="44" style="display:block;border:0;border-radius:11px;outline:none;text-decoration:none;" />
            </td>
            <td style="padding-left:12px;vertical-align:middle;font-family:${FONT_STACK};font-size:22px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.01em;">
              Schulab
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 32px;">
        <div style="height:1px;background:${BRAND.border};line-height:1px;font-size:1px;">&nbsp;</div>
      </td>
    </tr>
  </table>`;
}

/**
 * Footer with legal line and a subtle support link. Keep it minimal —
 * transactional emails do not need social buttons or marketing copy.
 */
function brandFooter(): string {
  const year = new Date().getFullYear();
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.card};">
    <tr>
      <td style="padding:0 32px;">
        <div style="height:1px;background:${BRAND.border};line-height:1px;font-size:1px;">&nbsp;</div>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:24px 32px 28px;font-family:${FONT_STACK};font-size:12px;line-height:1.6;color:${BRAND.subtle};">
        <p style="margin:0 0 6px;color:${BRAND.muted};font-weight:600;">Schulab — Launch young minds.</p>
        <p style="margin:0;">
          Need help?
          <a href="${APP_URL}/en/contact" style="color:${BRAND.indigo};text-decoration:none;font-weight:500;">Contact support</a>
        </p>
        <p style="margin:10px 0 0;color:${BRAND.subtle};">
          &copy; ${year} Schulab. All rights reserved.
        </p>
      </td>
    </tr>
  </table>`;
}

/**
 * Bulletproof CTA button. Table-based so Outlook renders padding and
 * background correctly; <a> carries the click target. We avoid VML for
 * simplicity — Outlook shows a slightly flatter button but the colour
 * and text are always preserved.
 */
type ButtonVariant = "primary" | "success" | "danger" | "neutral";
function button(
  text: string,
  url: string,
  variant: ButtonVariant = "primary"
): string {
  const bg =
    variant === "success"
      ? BRAND.success
      : variant === "danger"
      ? BRAND.danger
      : variant === "neutral"
      ? BRAND.ink
      : BRAND.indigo;
  const safeText = escapeHtml(text);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto;">
    <tr>
      <td style="background:${bg};border-radius:10px;box-shadow:0 6px 16px rgba(79,63,240,0.18);">
        <a href="${url}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 34px;font-family:${FONT_STACK};font-size:15px;font-weight:600;line-height:1;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
          ${safeText}
        </a>
      </td>
    </tr>
  </table>`;
}

/**
 * Subtle bordered card for secondary content — verification codes,
 * metadata blocks, quoted messages, etc.
 */
function card(content: string, tone: "neutral" | "success" | "info" = "neutral"): string {
  const palette =
    tone === "success"
      ? { bg: "#F0FDF4", border: "#BBF7D0" }
      : tone === "info"
      ? { bg: BRAND.soft, border: "#DBEAFE" }
      : { bg: "#F8FAFC", border: BRAND.border };
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${palette.bg};border:1px solid ${palette.border};border-radius:12px;margin:20px 0;">
    <tr>
      <td style="padding:18px 20px;font-family:${FONT_STACK};font-size:14px;line-height:1.6;color:${BRAND.body};">
        ${content}
      </td>
    </tr>
  </table>`;
}

/**
 * Main headline + supporting paragraph. Keeps typography consistent
 * across templates and avoids the "every email styles h2 differently"
 * problem.
 */
function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-family:${FONT_STACK};font-size:26px;line-height:1.25;font-weight:800;color:${BRAND.ink};letter-spacing:-0.02em;">
    ${text}
  </h1>`;
}

function paragraph(text: string, tone: "body" | "muted" = "body"): string {
  const color = tone === "muted" ? BRAND.muted : BRAND.body;
  return `<p style="margin:0 0 14px;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${color};">
    ${text}
  </p>`;
}

/**
 * Two-column feature grid for the welcome email. Built with a plain
 * <table> so Outlook lays the cells side-by-side; on narrow mobile
 * clients they reflow because each cell is set to width:50% of the
 * parent (which is itself 100% of the email body).
 */
function featureGrid(
  items: Array<{ icon: string; title: string; body: string }>
): string {
  const cell = (item: { icon: string; title: string; body: string } | null) => {
    if (!item) return `<td width="50%" style="padding:8px;"></td>`;
    return `<td width="50%" valign="top" style="padding:8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FAFBFF;border:1px solid ${BRAND.border};border-radius:12px;">
        <tr>
          <td style="padding:18px;font-family:${FONT_STACK};">
            <div style="font-size:22px;line-height:1;margin-bottom:10px;">${item.icon}</div>
            <div style="font-size:14px;font-weight:700;color:${BRAND.ink};margin-bottom:4px;letter-spacing:-0.01em;">${escapeHtml(item.title)}</div>
            <div style="font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(item.body)}</div>
          </td>
        </tr>
      </table>
    </td>`;
  };

  const rows: string[] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(`<tr>${cell(items[i])}${cell(items[i + 1] ?? null)}</tr>`);
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:12px 0 8px;">
    ${rows.join("")}
  </table>`;
}

/**
 * Checklist — numbered step list styled as a premium next-steps block.
 */
function checklist(items: string[]): string {
  const rows = items
    .map(
      (item, idx) => `<tr>
        <td width="28" valign="top" style="padding:4px 10px 4px 0;">
          <div style="width:22px;height:22px;border-radius:999px;background:${BRAND.soft};color:${BRAND.indigo};font-family:${FONT_STACK};font-size:12px;font-weight:700;text-align:center;line-height:22px;">${idx + 1}</div>
        </td>
        <td valign="top" style="padding:4px 0;font-family:${FONT_STACK};font-size:14px;line-height:1.6;color:${BRAND.body};">
          ${escapeHtml(item)}
        </td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 20px;">
    ${rows}
  </table>`;
}

// ── Layout shell ────────────────────────────────────────────────────

interface LayoutOptions {
  preview: string; // inbox preview text (subject-line complement)
  content: string; // body HTML
  accent?: "indigo" | "success" | "orange" | "danger";
}

function layout({ preview, content, accent = "indigo" }: LayoutOptions): string {
  const accentColor =
    accent === "success"
      ? BRAND.success
      : accent === "orange"
      ? BRAND.orange
      : accent === "danger"
      ? BRAND.danger
      : BRAND.indigo;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Schulab</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">
  ${preheader(preview)}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.page};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:${BRAND.card};border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04);">
          <tr>
            <td style="height:4px;background:${accentColor};background-image:linear-gradient(90deg,${BRAND.indigo},${BRAND.purple},${BRAND.orange});line-height:4px;font-size:4px;">&nbsp;</td>
          </tr>
          <tr><td>${brandHeader()}</td></tr>
          <tr>
            <td style="padding:28px 40px 8px;font-family:${FONT_STACK};">
              ${content}
            </td>
          </tr>
          <tr><td>${brandFooter()}</td></tr>
        </table>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:18px 16px 0;font-family:${FONT_STACK};font-size:11px;line-height:1.5;color:${BRAND.subtle};">
              You're receiving this because a Schulab account is associated with this email address.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Public Email Functions ───────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/en/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Reset your Schulab password",
    html: layout({
      preview: "Use this secure link to choose a new Schulab password.",
      content: `
        ${heading("Reset your password")}
        ${paragraph(
          "We received a request to reset the password on your Schulab account. Click below to choose a new one — the link is valid for the next hour."
        )}
        ${button("Choose a new password", resetUrl)}
        ${card(
          `<strong style="color:${BRAND.ink};">Didn't ask for this?</strong><br/>
           You can safely ignore this email — your password will not be changed, and no one can access your account with this link unless they also have your email inbox.`,
          "info"
        )}
        ${paragraph(
          `Button not working? Open this link in your browser:<br/>
           <a href="${resetUrl}" style="color:${BRAND.indigo};word-break:break-all;text-decoration:none;">${resetUrl}</a>`,
          "muted"
        )}
      `,
    }),
  });
}

export async function sendEmailVerification(email: string, token: string) {
  const verifyUrl = `${APP_URL}/en/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Confirm your email — Schulab",
    html: layout({
      preview: "One click to activate your Schulab account.",
      content: `
        ${heading("Confirm your email")}
        ${paragraph(
          "Thanks for creating a Schulab account. Please confirm your email address so we know it's really you — it takes one click."
        )}
        ${button("Verify my email", verifyUrl)}
        ${card(
          `<strong style="color:${BRAND.ink};">Link expires in 24 hours.</strong><br/>
           If you didn't create a Schulab account, you can safely ignore this message — no account will be activated.`,
          "info"
        )}
        ${paragraph(
          `Having trouble with the button? Copy this link into your browser:<br/>
           <a href="${verifyUrl}" style="color:${BRAND.indigo};word-break:break-all;text-decoration:none;">${verifyUrl}</a>`,
          "muted"
        )}
      `,
    }),
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: "STUDENT" | "PARENT" | "TUTOR" = "STUDENT"
) {
  const safeName = escapeHtml(name);
  const firstName = safeName.split(" ")[0] || safeName;

  // Per-role copy: heading + preview + feature cards + checklist + CTA
  // all vary so each audience lands on material that matches what they
  // actually do on the product.
  const variants = {
    STUDENT: {
      subject: `${name}, your Schulab account is ready 🚀`,
      preview:
        "Your Schulab learner account is live — here's how to get started.",
      eyebrow: "WELCOME TO SCHULAB",
      headline: `Let's launch your learning, ${firstName}.`,
      intro:
        "Your learner account is all set up. You're a click away from interactive STEM courses, live expert tutoring, and hands-on science — designed for ages 3–18.",
      ctaLabel: "Open my dashboard",
      ctaUrl: `${APP_URL}/en/student`,
      features: [
        { icon: "🎯", title: "Interactive courses", body: "Bite-sized lessons in science, tech, engineering, art and maths." },
        { icon: "🏆", title: "Badges & certificates", body: "Earn achievements as you progress and share them with pride." },
        { icon: "👩‍🏫", title: "1:1 expert tutors", body: "Book live sessions with vetted STEM educators whenever you need." },
        { icon: "🔥", title: "Streaks & quests", body: "Daily challenges and learning streaks keep motivation high." },
      ],
      checklistTitle: "Your first 5 minutes",
      checklist: [
        "Browse the course catalogue and enrol in your first course",
        "Pick your avatar and favourite subjects",
        "Try one interactive lesson to earn your first badge",
      ],
    },
    PARENT: {
      subject: `Welcome to Schulab, ${name} 👋`,
      preview:
        "Your Schulab parent account is ready — everything you need to support your child's learning.",
      eyebrow: "WELCOME TO SCHULAB",
      headline: `A calmer way to follow your child's learning.`,
      intro:
        "Your parent account is ready. Link your child's profile, follow progress at a glance, and manage everything — from subscriptions to privacy — in one clear dashboard.",
      ctaLabel: "Open parent dashboard",
      ctaUrl: `${APP_URL}/en/parent`,
      features: [
        { icon: "👨‍👩‍👧", title: "Link your children", body: "Create or connect your child's learner profile in a few taps." },
        { icon: "📊", title: "Progress at a glance", body: "Streaks, time spent, completed lessons and certificates in one view." },
        { icon: "🛡️", title: "Safety & consent", body: "COPPA/GDPR-K controls, moderation and age-appropriate content." },
        { icon: "💳", title: "One place to pay", body: "Manage subscriptions, invoices and payment methods without friction." },
      ],
      checklistTitle: "Getting set up",
      checklist: [
        "Add your child(ren) and link their learner accounts",
        "Review your privacy, consent and communication preferences",
        "Pick a plan that fits your family and start a first course",
      ],
    },
    TUTOR: {
      subject: `${name}, welcome to the Schulab tutor community 🚀`,
      preview:
        "Your tutor account is created — complete your profile to start accepting bookings.",
      eyebrow: "WELCOME TO SCHULAB",
      headline: `Teach what you love, on your own schedule.`,
      intro:
        "Your tutor account is created. Finish your profile so our team can review your application — once approved, you'll be able to accept bookings from families worldwide.",
      ctaLabel: "Complete my tutor profile",
      ctaUrl: `${APP_URL}/en/tutor/profile`,
      features: [
        { icon: "🗓️", title: "You set the hours", body: "Publish your availability and work as much or as little as you like." },
        { icon: "💶", title: "Transparent payouts", body: "Set your hourly rate; we handle billing, invoicing and payouts." },
        { icon: "🎓", title: "Global student base", body: "Reach motivated families across Europe and beyond." },
        { icon: "🧰", title: "Built-in tooling", body: "Calendar, video room, lesson notes and progress tracking — ready to go." },
      ],
      checklistTitle: "To get approved",
      checklist: [
        "Fill in your bio, subjects, qualifications and experience",
        "Upload a government ID for identity verification",
        "Set your hourly rate and weekly availability, then submit for review",
      ],
    },
  } as const;

  const v = variants[role] ?? variants.STUDENT;

  const hero = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.indigo};background-image:linear-gradient(135deg,${BRAND.indigo} 0%,${BRAND.purple} 55%,${BRAND.orange} 100%);border-radius:16px;margin:4px 0 24px;">
    <tr>
      <td style="padding:32px 28px;font-family:${FONT_STACK};">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:rgba(255,255,255,0.85);text-transform:uppercase;margin-bottom:10px;">${v.eyebrow}</div>
        <div style="font-size:26px;line-height:1.2;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">${v.headline}</div>
      </td>
    </tr>
  </table>`;

  return sendEmail({
    to: email,
    subject: v.subject,
    html: layout({
      preview: v.preview,
      accent: "orange",
      content: `
        ${hero}
        ${paragraph(`Hi ${firstName}, ${v.intro}`)}
        ${button(v.ctaLabel, v.ctaUrl)}
        <div style="margin-top:8px;">
          ${featureGrid([...v.features])}
        </div>
        <h2 style="margin:28px 0 8px;font-family:${FONT_STACK};font-size:16px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.01em;">${v.checklistTitle}</h2>
        ${checklist([...v.checklist])}
        ${card(
          `<strong style="color:${BRAND.ink};">Got a question?</strong> Reply to this email or reach us at <a href="${APP_URL}/en/contact" style="color:${BRAND.indigo};text-decoration:none;">our support centre</a> — a real human will get back to you.`,
          "info"
        )}
      `,
    }),
  });
}

export async function sendEnrollmentConfirmation(
  email: string,
  name: string,
  courseTitle: string
) {
  const courseUrl = `${APP_URL}/en/student/courses`;
  const safeName = escapeHtml(name);
  const firstName = safeName.split(" ")[0] || safeName;
  const safeCourseTitle = escapeHtml(courseTitle);

  return sendEmail({
    to: email,
    subject: `You're enrolled in ${courseTitle}`,
    html: layout({
      preview: `You're now enrolled in ${courseTitle}. Time to dive in.`,
      accent: "orange",
      content: `
        ${heading("You're enrolled 🎉")}
        ${paragraph(
          `Hi ${firstName}, welcome aboard! Your seat in <strong style="color:${BRAND.ink};">${safeCourseTitle}</strong> is confirmed. The course is waiting for you — jump in whenever you're ready.`
        )}
        ${button("Start learning", courseUrl)}
        ${card(
          `<strong style="color:${BRAND.ink};">A tip to make it stick:</strong> short, daily sessions beat long, once-a-week sprints. Even 10 focused minutes build a streak.`,
          "info"
        )}
      `,
    }),
  });
}

export async function sendCertificateEmail(
  email: string,
  name: string,
  courseTitle: string,
  certCode: string
) {
  const verifyUrl = `${APP_URL}/en/verify/${encodeURIComponent(certCode)}`;
  const downloadUrl = `${APP_URL}/api/certificates/${encodeURIComponent(certCode)}/download`;
  const safeName = escapeHtml(name);
  const firstName = safeName.split(" ")[0] || safeName;
  const safeCourseTitle = escapeHtml(courseTitle);
  const safeCertCode = escapeHtml(certCode);

  return sendEmail({
    to: email,
    subject: `🎓 Certificate earned: ${courseTitle}`,
    html: layout({
      preview: `You completed ${courseTitle}. Download and share your certificate.`,
      accent: "success",
      content: `
        ${heading(`Congratulations, ${firstName} 🎓`)}
        ${paragraph(
          `You've completed <strong style="color:${BRAND.ink};">${safeCourseTitle}</strong> and earned a verified certificate of completion. That's a real milestone — proud of you.`
        )}
        ${card(
          `<div style="font-size:11px;font-weight:700;letter-spacing:0.14em;color:${BRAND.muted};text-transform:uppercase;margin-bottom:6px;">Verification code</div>
           <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:18px;font-weight:700;color:${BRAND.success};letter-spacing:1px;">${safeCertCode}</div>
           <div style="font-size:12px;color:${BRAND.muted};margin-top:8px;">Anyone can verify this certificate's authenticity using the code above at <a href="${verifyUrl}" style="color:${BRAND.indigo};text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}/en/verify</a>.</div>`,
          "success"
        )}
        ${button("Download certificate (PDF)", downloadUrl, "success")}
        ${paragraph(
          `Share your achievement with family, friends and employers — add it to LinkedIn, attach it to a CV, or frame it on the wall.`,
          "muted"
        )}
      `,
    }),
  });
}

export async function sendTutorApprovedEmail(email: string, name: string) {
  const dashboardUrl = `${APP_URL}/en/tutor`;
  const safeName = escapeHtml(name);
  const firstName = safeName.split(" ")[0] || safeName;

  return sendEmail({
    to: email,
    subject: "You're approved — welcome to the Schulab tutor community 🎉",
    html: layout({
      preview: "Your tutor application is approved. Open bookings and get started.",
      accent: "success",
      content: `
        ${heading(`You're in, ${firstName} 🎉`)}
        ${paragraph(
          `Your tutor application has been <strong style="color:${BRAND.success};">approved</strong>. You can now publish your availability and start accepting bookings from students and families worldwide.`
        )}
        ${button("Open tutor dashboard", dashboardUrl, "success")}
        <h2 style="margin:24px 0 8px;font-family:${FONT_STACK};font-size:16px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.01em;">Your first week</h2>
        ${checklist([
          "Publish your weekly availability so students can find bookable slots",
          "Polish your profile — a great bio and photo lift conversion significantly",
          "Respond to your first booking within 24 hours to lock in a strong rating",
        ])}
        ${card(
          `<strong style="color:${BRAND.ink};">Tip:</strong> tutors who add a 45-second intro video see ~2× more bookings in their first month. You can upload one from your profile page.`,
          "info"
        )}
      `,
    }),
  });
}

export async function sendTutorRejectedEmail(email: string, name: string) {
  const profileUrl = `${APP_URL}/en/tutor/profile`;
  const safeName = escapeHtml(name);
  const firstName = safeName.split(" ")[0] || safeName;

  return sendEmail({
    to: email,
    subject: "An update on your Schulab tutor application",
    html: layout({
      preview:
        "Your tutor application needs a few updates before it can be approved.",
      content: `
        ${heading(`Hi ${firstName}`)}
        ${paragraph(
          `Thanks for applying to tutor on Schulab. After review, we weren't able to approve your application in its current state — typically this is because some profile details or verification documents are missing or unclear.`
        )}
        ${paragraph(
          `The good news: this isn't a final decision. Update your profile and submit for review again — our team will take a fresh look.`
        )}
        ${button("Update my profile", profileUrl)}
        ${card(
          `<strong style="color:${BRAND.ink};">Think we got it wrong?</strong> We're human and we make mistakes. Reply to this email or reach our <a href="${APP_URL}/en/contact" style="color:${BRAND.indigo};text-decoration:none;">support team</a> — we'll review your case personally.`,
          "info"
        )}
      `,
    }),
  });
}

export async function sendNewTutorApplicationEmail(tutorName: string, tutorEmail: string) {
  const adminEmail = process.env.CONTACT_EMAIL || "admin@schulab.com";
  const safeTutorName = escapeHtml(tutorName);
  const safeTutorEmail = escapeHtml(tutorEmail);

  return sendEmail({
    to: adminEmail,
    subject: `[Schulab] New tutor application — ${tutorName}`,
    html: layout({
      preview: `${tutorName} just submitted a tutor application for review.`,
      content: `
        ${heading("New tutor application")}
        ${paragraph(
          `A new tutor has submitted their profile for review. Please verify their documents and make an approval decision within 2 business days to keep our response-time promise.`
        )}
        ${card(
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td width="80" style="padding:4px 8px 4px 0;font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">Name</td><td style="padding:4px 0;font-size:14px;color:${BRAND.ink};">${safeTutorName}</td></tr>
            <tr><td width="80" style="padding:4px 8px 4px 0;font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">Email</td><td style="padding:4px 0;font-size:14px;color:${BRAND.ink};"><a href="mailto:${safeTutorEmail}" style="color:${BRAND.indigo};text-decoration:none;">${safeTutorEmail}</a></td></tr>
          </table>`
        )}
        ${button("Review pending applications", `${APP_URL}/en/admin/tutors`)}
      `,
    }),
  });
}

export async function sendContactFormEmail(
  name: string,
  email: string,
  subject: string,
  message: string
) {
  const adminEmail = process.env.CONTACT_EMAIL || "admin@schulab.com";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  return sendEmail({
    to: adminEmail,
    subject: `[Schulab] Contact form — ${subject}`,
    html: layout({
      preview: `${name} sent a message via the contact form.`,
      content: `
        ${heading("New contact form message")}
        ${paragraph(
          `Someone just reached out through the Schulab website. Details below — reply directly to <a href="mailto:${safeEmail}" style="color:${BRAND.indigo};text-decoration:none;">${safeEmail}</a> to respond.`,
          "muted"
        )}
        ${card(
          `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td width="80" style="padding:4px 8px 4px 0;font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">From</td><td style="padding:4px 0;font-size:14px;color:${BRAND.ink};">${safeName} &lt;<a href="mailto:${safeEmail}" style="color:${BRAND.indigo};text-decoration:none;">${safeEmail}</a>&gt;</td></tr>
            <tr><td width="80" style="padding:4px 8px 4px 0;font-size:12px;font-weight:700;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;">Subject</td><td style="padding:4px 0;font-size:14px;color:${BRAND.ink};">${safeSubject}</td></tr>
          </table>`
        )}
        <div style="margin-top:8px;font-family:${FONT_STACK};font-size:11px;font-weight:700;letter-spacing:0.14em;color:${BRAND.muted};text-transform:uppercase;">Message</div>
        <div style="margin:8px 0 0;padding:18px 20px;background:#FAFAFF;border:1px solid ${BRAND.border};border-radius:12px;font-family:${FONT_STACK};font-size:15px;line-height:1.65;color:${BRAND.ink};white-space:pre-wrap;">${safeMessage}</div>
      `,
    }),
  });
}
