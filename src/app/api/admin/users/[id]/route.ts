import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { ApiError, NotFoundError } from "@/lib/errors"
import { z } from "zod"

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  adminNotes: z.string().max(500).optional(),
})

export const PUT = withAuth(async (req, { userId, params }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!me || !["ADMIN", "SUPER_ADMIN"].includes(me.role)) {
    throw new ApiError(403, "FORBIDDEN", "Acceso denegado")
  }

  const body = await parseBody(req)
  const data = updateUserSchema.parse(body)
  const targetId = params.id

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) throw new NotFoundError("Usuario", targetId)

  const user = await prisma.user.update({
    where: { id: targetId },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  return success(user)
})

export const DELETE = withAuth(async (req, { userId, params }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!me || me.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "FORBIDDEN", "Solo Super Admin puede eliminar usuarios")
  }

  const targetId = params.id
  await prisma.user.update({
    where: { id: targetId },
    data: { deletedAt: new Date(), isActive: false },
  })

  return success({ success: true })
})
