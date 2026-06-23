import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody, ApiError } from "@/lib/api-utils"
import { budgetSchema, budgetUpdateSchema } from "@/lib/validations"

export const GET = withAuth(async (req, { userId }) => {
  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  })

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spentAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
        _sum: { amount: true },
      })

      return {
        ...budget,
        spent: spentAgg._sum.amount || 0,
      }
    })
  )

  return success(budgetsWithSpent)
})

export const POST = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = budgetSchema.parse(body)

  const now = new Date()
  const month = data.month || now.getMonth() + 1
  const year = data.year || now.getFullYear()

  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, userId },
  })

  if (!category) {
    throw new ApiError(404, "CATEGORY_NOT_FOUND", "Categoría no encontrada")
  }

  if (category.type !== "EXPENSE") {
    throw new ApiError(400, "INVALID_CATEGORY", "Solo se pueden crear presupuestos para categorías de gasto")
  }

  const existingSpent = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId: data.categoryId,
      type: "EXPENSE",
      date: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
    _sum: { amount: true },
  })

  const budget = await prisma.budget.upsert({
    where: {
      categoryId_userId_month_year: { categoryId: data.categoryId, userId, month, year },
    },
    update: {
      amount: data.amount,
      percentage: data.percentage || 0,
      spent: existingSpent._sum.amount || 0,
    },
    create: {
      amount: data.amount,
      percentage: data.percentage || 0,
      spent: existingSpent._sum.amount || 0,
      month,
      year,
      categoryId: data.categoryId,
      userId,
    },
    include: { category: true },
  })

  return success(budget, 201)
})

export const PUT = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = budgetUpdateSchema.parse(body)

  const existing = await prisma.budget.findFirst({
    where: { id: data.id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "BUDGET_NOT_FOUND", "Presupuesto no encontrado")
  }

  const updateData: Record<string, unknown> = {}
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.percentage !== undefined) updateData.percentage = data.percentage

  const budget = await prisma.budget.update({
    where: { id: data.id },
    data: updateData,
    include: { category: true },
  })

  return success(budget)
})

export const DELETE = withAuth(async (req, { userId }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    throw new ApiError(400, "MISSING_ID", "ID de presupuesto requerido")
  }

  const existing = await prisma.budget.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "BUDGET_NOT_FOUND", "Presupuesto no encontrado")
  }

  await prisma.budget.delete({ where: { id } })

  return success({ success: true })
})
