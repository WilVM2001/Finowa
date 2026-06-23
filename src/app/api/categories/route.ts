import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { categorySchema } from "@/lib/validations"

export const GET = withAuth(async (req, { userId }) => {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  })

  return success(categories)
})

export const POST = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = categorySchema.parse(body)

  const existing = await prisma.category.findFirst({
    where: { name: data.name, userId },
  })

  if (existing) {
    return success({ error: "La categoría ya existe", code: "CATEGORY_EXISTS" }, 409)
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
      userId,
    },
  })

  return success(category, 201)
})
