import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"
import { ApiError } from "@/lib/errors"

export const GET = withAuth(async (req, { userId }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!me || !["ADMIN", "SUPER_ADMIN"].includes(me.role)) {
    throw new ApiError(403, "FORBIDDEN", "Acceso denegado")
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  })

  return success(logs)
})
