import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"
import { ApiError } from "@/lib/errors"

export const GET = withAuth(async (req, { userId }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    throw new ApiError(403, "FORBIDDEN", "Acceso denegado")
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    totalTransactions,
    adminCount,
    recentUsers,
    activeThisMonth,
    newThisWeek,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.transaction.count(),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, deletedAt: null } }),
    prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.user.count({
      where: {
        deletedAt: null,
        updatedAt: { gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)) },
      },
    }),
    prisma.user.count({
      where: { createdAt: { gte: weekAgo }, deletedAt: null },
    }),
  ])

  return success({
    totalUsers,
    totalTransactions,
    adminCount,
    activeThisMonth,
    newThisWeek,
    recentUsers,
  })
})
