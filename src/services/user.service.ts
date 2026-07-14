import { db } from "@/lib/db";
import { getUserEnrollments } from "@/services/enrollment.service";

export async function getUserById(userId: string) {
  try {
    return await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  } catch {
    return null;
  }
}

export async function getChildren(parentId: string) {
  try {
    const links = await db.parentChild.findMany({
      where: { parentId },
      include: {
        child: true,
      },
    });
    return await Promise.all(
      links.map(async ({ child }) => ({
        ...child,
        enrollments: await getUserEnrollments(child.id),
      }))
    );
  } catch (error) {
    console.error("Failed to get linked children:", error);
    return [];
  }
}

export async function getStudentStats(userId: string) {
  try {
    const [enrollments, badges, points, certificates] = await Promise.all([
      db.enrollment.count({ where: { userId } }),
      db.userBadge.count({ where: { userId } }),
      db.pointTransaction.aggregate({
        where: { userId },
        _sum: { points: true },
      }),
      db.certificate.count({ where: { userId } }),
    ]);

    return {
      enrollments,
      badges,
      totalPoints: points._sum.points ?? 0,
      certificates,
    };
  } catch {
    return { enrollments: 0, badges: 0, totalPoints: 0, certificates: 0 };
  }
}
