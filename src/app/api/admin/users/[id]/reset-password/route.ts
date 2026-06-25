import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { ApiError, NotFoundError } from "@/lib/errors"
import { hash } from "bcryptjs"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

export const PUT = withAuth(async (req, { userId, params }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!me || me.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "FORBIDDEN", "Solo Super Admin puede restablecer contraseñas")
  }

  const body = await parseBody(req)
  const data = resetPasswordSchema.parse(body)
  const targetId = params.id

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) throw new NotFoundError("Usuario", targetId)

  const hashedPassword = await hash(data.newPassword, 12)
  await prisma.user.update({
    where: { id: targetId },
    data: { password: hashedPassword },
  })

  await createAuditLog(userId, "PASSWORD_RESET", "User", targetId, { resetBy: userId })

  return success({ success: true })
})
