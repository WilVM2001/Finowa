import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { transactionSchema } from "@/lib/validations"
import { z } from "zod"

const batchSchema = z.object({
  transactions: z.array(transactionSchema).min(1).max(100),
})

export const POST = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = batchSchema.parse(body)

  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true },
  })
  const validCategoryIds = new Set(categories.map((c) => c.id))

  for (const tx of data.transactions) {
    if (!validCategoryIds.has(tx.categoryId)) {
      return success(
        { error: `Categoría inválida: ${tx.categoryId}`, code: "INVALID_CATEGORY" },
        400
      )
    }
  }

  const created = await prisma.transaction.createMany({
    data: data.transactions.map((tx) => ({
      amount: tx.amount,
      type: tx.type,
      description: tx.description,
      date: tx.date ? new Date(tx.date) : new Date(),
      categoryId: tx.categoryId,
      userId,
    })),
  })

  return success({ count: created.count }, 201)
})

const deleteBatchSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
})

export const DELETE = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = deleteBatchSchema.parse(body)

  const { count } = await prisma.transaction.deleteMany({
    where: {
      id: { in: data.ids },
      userId,
    },
  })

  return success({ count })
})
