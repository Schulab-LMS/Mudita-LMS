import { Resend } from "resend";

// Minimal text-in HTML sender used by the drip journey. Kept separate from
// email.ts so drip templates can stay as plain strings (composable by the
// service) instead of being forced through the branded layout helpers.

let _resend: Resend | null = null;
function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Schulab <noreply@schulab.com>";

export async function sendDripEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.log(`[drip] would send to ${input.to}: ${input.subject}`);
    return { success: true, dev: true };
  }
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: wrap(input.html),
  });
  if (error) throw new Error(error.message);
  return { success: true };
}

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    ${content}
  </div>
</body></html>`;
}
