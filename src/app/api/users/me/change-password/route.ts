import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody, ApiError } from "@/lib/api-utils"
import { compare, hash } from "bcryptjs"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
})

export const PUT = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = changePasswordSchema.parse(body)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.password) {
    throw new ApiError(404, "NOT_FOUND", "Usuario no encontrado")
  }

  const isValid = await compare(data.currentPassword, user.password)
  if (!isValid) {
    throw new ApiError(401, "INVALID_PASSWORD", "La contraseña actual es incorrecta")
  }

  const hashedPassword = await hash(data.newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return success({ success: true })
})
