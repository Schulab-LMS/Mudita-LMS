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

function layout(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:24px 32px;">
      <h1 style="margin:0;color:white;font-size:20px;font-weight:700;letter-spacing:0.5px;">Schulab</h1>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        &copy; ${new Date().getFullYear()} Schulab. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function button(text: string, url: string) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#2563eb;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      ${text}
    </a>
  </div>`;
}

// ── Public Email Functions ───────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/en/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Reset your password — Schulab",
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Reset your password</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        We received a request to reset your password. Click the button below to choose a new one.
        This link expires in <strong>1 hour</strong>.
      </p>
      ${button("Reset Password", resetUrl)}
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;">
        If you didn't request this, you can safely ignore this email. Your password won't be changed.
      </p>
      <p style="color:#d1d5db;font-size:11px;word-break:break-all;">
        ${resetUrl}
      </p>
    `),
  });
}

export async function sendEmailVerification(email: string, token: string) {
  const verifyUrl = `${APP_URL}/en/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your email — Schulab",
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Verify your email</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Welcome to Schulab! Please verify your email address by clicking the button below.
      </p>
      ${button("Verify Email", verifyUrl)}
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;">
        This link expires in 24 hours. If you didn't create an account, ignore this email.
      </p>
    `),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const dashboardUrl = `${APP_URL}/en/student`;
  const safeName = escapeHtml(name);

  return sendEmail({
    to: email,
    subject: `Welcome to Schulab, ${name}!`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Welcome, ${safeName}! 🎉</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Your account is all set up. Start exploring our STEM courses designed for young learners ages 3–18.
      </p>
      ${button("Go to Dashboard", dashboardUrl)}
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Here's what you can do:
      </p>
      <ul style="color:#6b7280;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Browse and enroll in courses</li>
        <li>Track your learning progress</li>
        <li>Earn badges and certificates</li>
        <li>Book sessions with tutors</li>
      </ul>
    `),
  });
}

export async function sendEnrollmentConfirmation(
  email: string,
  name: string,
  courseTitle: string
) {
  const courseUrl = `${APP_URL}/en/student/courses`;
  const safeName = escapeHtml(name);
  const safeCourseTitle = escapeHtml(courseTitle);

  return sendEmail({
    to: email,
    subject: `Enrolled: ${courseTitle} — Schulab`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">You're enrolled! 📚</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Hi ${safeName}, you've been enrolled in <strong>${safeCourseTitle}</strong>.
        Start learning right away!
      </p>
      ${button("Start Learning", courseUrl)}
    `),
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
  const safeCourseTitle = escapeHtml(courseTitle);
  const safeCertCode = escapeHtml(certCode);

  return sendEmail({
    to: email,
    subject: `Certificate earned: ${courseTitle} — Schulab`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Congratulations, ${safeName}! 🎓</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        You've completed <strong>${safeCourseTitle}</strong> and earned a certificate of completion!
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">Verification Code</p>
        <p style="margin:0;font-family:monospace;font-size:16px;font-weight:700;color:#15803d;letter-spacing:1px;">${safeCertCode}</p>
      </div>
      ${button("Download Certificate (PDF)", downloadUrl)}
      <p style="color:#9ca3af;font-size:12px;line-height:1.6;text-align:center;margin-top:8px;">
        Or <a href="${verifyUrl}" style="color:#6b7280;">verify online</a>.
      </p>
    `),
  });
}

export async function sendTutorApprovedEmail(email: string, name: string) {
  const dashboardUrl = `${APP_URL}/en/tutor`;
  const safeName = escapeHtml(name);

  return sendEmail({
    to: email,
    subject: "Your tutor application has been approved! — Schulab",
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Congratulations, ${safeName}!</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Your tutor application has been <strong style="color:#15803d;">approved</strong>.
        You can now set your availability and start accepting bookings from students.
      </p>
      ${button("Go to Tutor Dashboard", dashboardUrl)}
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        Next steps:
      </p>
      <ul style="color:#6b7280;font-size:14px;line-height:1.8;padding-left:20px;">
        <li>Set your availability schedule</li>
        <li>Complete your profile details</li>
        <li>Wait for students to book sessions</li>
      </ul>
    `),
  });
}

export async function sendTutorRejectedEmail(email: string, name: string) {
  const profileUrl = `${APP_URL}/en/tutor/profile`;
  const safeName = escapeHtml(name);

  return sendEmail({
    to: email,
    subject: "Update on your tutor application — Schulab",
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">Hi ${safeName},</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        After review, your tutor verification has been <strong style="color:#dc2626;">revoked</strong>.
        This may be due to incomplete profile information or other requirements.
      </p>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;">
        You can update your profile and it will be reviewed again by our team.
      </p>
      ${button("Update Profile", profileUrl)}
      <p style="color:#9ca3af;font-size:12px;line-height:1.5;">
        If you believe this was a mistake, please contact our support team.
      </p>
    `),
  });
}

export async function sendNewTutorApplicationEmail(tutorName: string, tutorEmail: string) {
  const adminEmail = process.env.CONTACT_EMAIL || "admin@schulab.com";
  const safeTutorName = escapeHtml(tutorName);
  const safeTutorEmail = escapeHtml(tutorEmail);

  return sendEmail({
    to: adminEmail,
    subject: `[New Tutor Application] ${tutorName}`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">New Tutor Application</h2>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>Name:</strong> ${safeTutorName}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;"><strong>Email:</strong> ${safeTutorEmail}</p>
      </div>
      ${button("Review Applications", `${APP_URL}/en/admin/tutors`)}
    `),
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
    subject: `[Contact Form] ${subject}`,
    html: layout(`
      <h2 style="margin:0 0 12px;font-size:22px;color:#1f2937;">New Contact Form Submission</h2>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;"><strong>Subject:</strong> ${safeSubject}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;"><strong>Message:</strong></p>
        <p style="margin:8px 0 0;font-size:14px;color:#1f2937;white-space:pre-wrap;">${safeMessage}</p>
      </div>
      <p style="color:#9ca3af;font-size:12px;">Reply directly to this email to respond to ${safeEmail}.</p>
    `),
  });
}
