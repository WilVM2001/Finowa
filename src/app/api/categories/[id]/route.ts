import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody, ApiError } from "@/lib/api-utils"
import { z } from "zod"

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export const PUT = withAuth(async (req, { userId, params }) => {
  const { id } = params
  const body = await parseBody(req)
  const data = updateCategorySchema.parse(body)

  const existing = await prisma.category.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Categoría no encontrada")
  }

  const updateData: Record<string, string> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  })

  return success(category)
})

export const DELETE = withAuth(async (req, { userId, params }) => {
  const { id } = params

  const existing = await prisma.category.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Categoría no encontrada")
  }

  const txCount = await prisma.transaction.count({
    where: { categoryId: id },
  })

  if (txCount > 0) {
    throw new ApiError(
      400,
      "CATEGORY_IN_USE",
      `No se puede eliminar: ${txCount} transacciones usan esta categoría`
    )
  }

  await prisma.category.delete({ where: { id } })

  return success({ success: true })
})
