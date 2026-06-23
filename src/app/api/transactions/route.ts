import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody, ApiError } from "@/lib/api-utils"
import { transactionSchema, transactionUpdateSchema } from "@/lib/validations"

export const GET = withAuth(async (req, { userId }) => {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const categoryId = searchParams.get("categoryId")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const sort = searchParams.get("sort") || "date"
  const order = searchParams.get("order") || "desc"
  const search = searchParams.get("search")

  const andConditions: Record<string, unknown>[] = []
  andConditions.push({ userId })

  if (type && ["INCOME", "EXPENSE"].includes(type)) {
    andConditions.push({ type })
  }

  if (categoryId) {
    andConditions.push({ categoryId })
  }

  if (search) {
    andConditions.push({ description: { contains: search } })
  }

  if (from || to) {
    const dateFilter: Record<string, Date> = {}
    if (from) dateFilter.gte = new Date(from)
    if (to) dateFilter.lte = new Date(to)
    andConditions.push({ date: dateFilter })
  }

  if (month && year) {
    const m = parseInt(month)
    const y = parseInt(year)
    andConditions.push({
      date: {
        gte: new Date(Date.UTC(y, m - 1, 1)),
        lt: new Date(Date.UTC(y, m, 1)),
      },
    })
  }

  const where = { AND: andConditions }

  const sortField = ["date", "amount", "createdAt"].includes(sort) ? (sort as "date" | "amount" | "createdAt") : "date"
  const sortOrder = order === "asc" ? "asc" : "desc" as const

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { [sortField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  return success({
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

export const POST = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = transactionSchema.parse(body)

  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, userId },
  })

  if (!category) {
    throw new ApiError(404, "CATEGORY_NOT_FOUND", "Categoría no encontrada")
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: data.amount,
      type: data.type,
      description: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      categoryId: data.categoryId,
      userId,
    },
    include: { category: true },
  })

  await updateBudgetSpent(userId, data.categoryId, data.type, data.amount)

  return success(transaction, 201)
})

async function updateBudgetSpent(userId: string, categoryId: string, type: string, amount: number) {
  if (type !== "EXPENSE") return

  const now = new Date()
  const month = now.getUTCMonth() + 1
  const year = now.getUTCFullYear()

  const budget = await prisma.budget.findUnique({
    where: {
      categoryId_userId_month_year: { categoryId, userId, month, year },
    },
  })

  if (budget) {
    await prisma.budget.update({
      where: { id: budget.id },
      data: { spent: { increment: amount } },
    })
  }
}

async function decrementBudgetSpent(userId: string, categoryId: string, date: Date, amount: number) {
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  const budget = await prisma.budget.findUnique({
    where: {
      categoryId_userId_month_year: { categoryId, userId, month, year },
    },
  })

  if (budget) {
    await prisma.budget.update({
      where: { id: budget.id },
      data: { spent: { decrement: amount } },
    })
  }
}

export const PUT = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = transactionUpdateSchema.parse(body)

  const existing = await prisma.transaction.findFirst({
    where: { id: data.id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "TRANSACTION_NOT_FOUND", "Transacción no encontrada")
  }

  const updateData: Record<string, unknown> = {}
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.description !== undefined) updateData.description = data.description
  if (data.type !== undefined) updateData.type = data.type
  if (data.categoryId !== undefined) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId },
    })
    if (!category) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Categoría no encontrada")
    updateData.categoryId = data.categoryId
  }
  if (data.date !== undefined) updateData.date = new Date(data.date)

  const transaction = await prisma.transaction.update({
    where: { id: data.id },
    data: updateData,
    include: { category: true },
  })

  return success(transaction)
})

export const DELETE = withAuth(async (req, { userId }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    throw new ApiError(400, "MISSING_ID", "ID de transacción requerido")
  }

  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "TRANSACTION_NOT_FOUND", "Transacción no encontrada")
  }

  await prisma.transaction.delete({ where: { id } })

  if (existing.type === "EXPENSE") {
    await decrementBudgetSpent(userId, existing.categoryId, existing.date, existing.amount)
  }

  return success({ success: true })
})
