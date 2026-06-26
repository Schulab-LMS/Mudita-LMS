import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendCertificateEmail } from "@/lib/email";

function newCode(): string {
  return randomBytes(12).toString("hex").toUpperCase();
}

export async function generateCertificate(userId: string, courseId: string) {
  try {
    const existing = await db.certificate.findFirst({
      where: { userId, courseId },
    });
    if (existing) return existing;

    const cert = await db.certificate.create({
      data: { userId, courseId, code: newCode(), issuedAt: new Date() },
    });

    // Send certificate email (non-blocking)
    try {
      const [user, course] = await Promise.all([
        db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
        db.course.findUnique({ where: { id: courseId }, select: { title: true } }),
      ]);
      if (user?.email && course) {
        sendCertificateEmail(user.email, user.name || "Student", course.title, cert.code).catch(() => null);
      }
    } catch {
      // non-critical
    }

    return cert;
  } catch {
    return null;
  }
}

// Issued when a learner completes all required courses in a bundle. Idempotent
// per (userId, bundleId), mirroring the course path.
export async function generateBundleCertificate(userId: string, bundleId: string) {
  try {
    const existing = await db.certificate.findFirst({
      where: { userId, bundleId },
    });
    if (existing) return existing;

    const cert = await db.certificate.create({
      data: { userId, bundleId, code: newCode(), issuedAt: new Date() },
    });

    try {
      const [user, bundle] = await Promise.all([
        db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
        db.bundle.findUnique({ where: { id: bundleId }, select: { title: true } }),
      ]);
      if (user?.email && bundle) {
        sendCertificateEmail(user.email, user.name || "Student", bundle.title, cert.code).catch(() => null);
      }
    } catch {
      // non-critical
    }

    return cert;
  } catch {
    return null;
  }
}

export type CertificateKind = "course" | "bundle";

// Resolve the human-facing subject (course or bundle) for a set of certs in two
// batched queries, returning a per-id map of { kind, title, slug, thumbnail }.
async function resolveSubjects(
  certs: { courseId: string | null; bundleId: string | null }[]
) {
  const courseIds = [...new Set(certs.map((c) => c.courseId).filter((id): id is string => !!id))];
  const bundleIds = [...new Set(certs.map((c) => c.bundleId).filter((id): id is string => !!id))];

  const [courses, bundles] = await Promise.all([
    courseIds.length
      ? db.course.findMany({ where: { id: { in: courseIds } }, select: { id: true, title: true, slug: true, thumbnail: true } })
      : Promise.resolve([]),
    bundleIds.length
      ? db.bundle.findMany({ where: { id: { in: bundleIds } }, select: { id: true, title: true, slug: true, thumbnail: true } })
      : Promise.resolve([]),
  ]);

  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const bundleMap = new Map(bundles.map((b) => [b.id, b]));

  return (cert: { courseId: string | null; bundleId: string | null }) => {
    if (cert.bundleId) {
      const b = bundleMap.get(cert.bundleId);
      return { kind: "bundle" as CertificateKind, title: b?.title ?? "Unknown Bundle", slug: b?.slug ?? "", thumbnail: b?.thumbnail ?? null };
    }
    const c = cert.courseId ? courseMap.get(cert.courseId) : undefined;
    return { kind: "course" as CertificateKind, title: c?.title ?? "Unknown Course", slug: c?.slug ?? "", thumbnail: c?.thumbnail ?? null };
  };
}

export async function getCertificates(userId: string) {
  try {
    const certs = await db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    });

    const subjectOf = await resolveSubjects(certs);
    return certs.map((cert) => ({ ...cert, ...subjectOf(cert) }));
  } catch {
    return [];
  }
}

export async function verifyCertificate(verificationCode: string) {
  try {
    const cert = await db.certificate.findUnique({
      where: { code: verificationCode },
      include: { user: { select: { name: true } } },
    });
    if (!cert) return null;

    const subjectOf = await resolveSubjects([cert]);
    return { ...cert, ...subjectOf(cert) };
  } catch {
    return null;
  }
}
