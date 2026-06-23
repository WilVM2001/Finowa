import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
})

export const GET = withAuth(async (req, { userId }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          transactions: true,
          categories: true,
          budgets: true,
          goals: true,
        },
      },
    },
  })

  if (!user) {
    return success({ error: "Usuario no encontrado" }, 404)
  }

  return success(user)
})

export const PUT = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = updateProfileSchema.parse(body)

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
    select: { id: true, name: true, email: true },
  })

  return success(user)
})
