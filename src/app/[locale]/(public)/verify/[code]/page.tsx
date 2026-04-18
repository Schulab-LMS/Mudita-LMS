import { verifyCertificate } from "@/services/certificate.service";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return { title: `Verify Certificate ${code} | Schulab` };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const cert = await verifyCertificate(code);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-lg">
        {cert ? (
          <div className="rounded-2xl border bg-white p-8 shadow-sm text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-green-700">
                Certificate Verified
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This certificate is authentic and valid.
              </p>
            </div>

            <div className="space-y-4 text-left rounded-xl bg-slate-50 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Awarded to
                </p>
                <p className="text-lg font-semibold">
                  {cert.user.name || "Student"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Course Completed
                </p>
                <p className="text-lg font-semibold">
                  {cert.course?.title || "Course"}
                </p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Date Issued
                  </p>
                  <p className="font-medium">
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Certificate ID
                  </p>
                  <p className="font-mono text-sm font-medium">{cert.code}</p>
                </div>
              </div>
            </div>

            <a
              href={`/api/certificates/${cert.code}/download`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              View Certificate
            </a>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-8 shadow-sm text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-red-700">
                Certificate Not Found
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                No certificate was found with verification code{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {code}
                </code>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please check the code and try again.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
