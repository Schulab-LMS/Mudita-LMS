import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const cert = await db.certificate.findUnique({
    where: { code },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  const course = await db.course.findUnique({
    where: { id: cert.courseId },
    select: { title: true },
  });

  const studentName = cert.user.name || cert.user.email || "Student";
  const courseTitle = course?.title || "Course";
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Certificate - ${courseTitle}</title>
  <style>
    @page { size: landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8f9fa;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .certificate {
      width: 1056px;
      height: 740px;
      background: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .border-outer {
      position: absolute;
      inset: 16px;
      border: 3px solid #1a365d;
      border-radius: 4px;
    }
    .border-inner {
      position: absolute;
      inset: 24px;
      border: 1px solid #bee3f8;
      border-radius: 2px;
    }
    .content {
      position: absolute;
      inset: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px 60px;
    }
    .logo-text {
      font-size: 18px;
      font-weight: bold;
      color: #2b6cb0;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .title {
      font-size: 42px;
      color: #1a365d;
      font-weight: normal;
      margin-bottom: 6px;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 14px;
      color: #718096;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 32px;
    }
    .presented-to {
      font-size: 13px;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .student-name {
      font-size: 36px;
      color: #2d3748;
      font-style: italic;
      border-bottom: 2px solid #bee3f8;
      padding-bottom: 8px;
      margin-bottom: 24px;
      min-width: 400px;
    }
    .course-label {
      font-size: 13px;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 6px;
    }
    .course-name {
      font-size: 22px;
      color: #2b6cb0;
      font-weight: bold;
      margin-bottom: 32px;
      max-width: 600px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      max-width: 700px;
    }
    .footer-item {
      text-align: center;
    }
    .footer-line {
      width: 180px;
      border-top: 1px solid #cbd5e0;
      margin-bottom: 6px;
    }
    .footer-label {
      font-size: 11px;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .footer-value {
      font-size: 13px;
      color: #4a5568;
      margin-bottom: 4px;
    }
    .verification {
      position: absolute;
      bottom: 30px;
      right: 50px;
      font-size: 10px;
      color: #cbd5e0;
      font-family: monospace;
    }
    @media print {
      body { background: white; }
      .certificate { box-shadow: none; }
      .no-print { display: none !important; }
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #2b6cb0;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .print-btn:hover { background: #2c5282; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Print / Save as PDF</button>
  <div class="certificate">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="content">
      <div class="logo-text">Schulab</div>
      <h1 class="title">Certificate of Completion</h1>
      <p class="subtitle">This is to certify that</p>
      <p class="presented-to">Presented to</p>
      <p class="student-name">${escapeHtml(studentName)}</p>
      <p class="course-label">Has successfully completed</p>
      <p class="course-name">${escapeHtml(courseTitle)}</p>
      <div class="footer">
        <div class="footer-item">
          <div class="footer-value">${issuedDate}</div>
          <div class="footer-line"></div>
          <div class="footer-label">Date of Completion</div>
        </div>
        <div class="footer-item">
          <div class="footer-value">${cert.code}</div>
          <div class="footer-line"></div>
          <div class="footer-label">Certificate ID</div>
        </div>
      </div>
    </div>
    <div class="verification">Verify at schulab.com/certificates/verify/${cert.code}</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
