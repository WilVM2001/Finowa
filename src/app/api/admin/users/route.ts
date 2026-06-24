import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { ApiError } from "@/lib/errors"
import { z } from "zod"

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
})

function adminGuard(role: string) {
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
    throw new ApiError(403, "FORBIDDEN", "Acceso denegado")
  }
}

export const GET = withAuth(async (req, { userId }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  adminGuard(me?.role ?? "")

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { transactions: true } } },
  })

  return success(users)
})
