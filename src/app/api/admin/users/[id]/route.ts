import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody } from "@/lib/api-utils"
import { ApiError, NotFoundError } from "@/lib/errors"
import { z } from "zod"
import { createAuditLog } from "@/lib/audit"

const updateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  adminNotes: z.string().max(500).optional(),
})

function adminGuard(role: string) {
  if (!["ADMIN", "SUPER_ADMIN"].includes(role)) throw new ApiError(403, "FORBIDDEN", "Acceso denegado")
}

export const GET = withAuth(async (req, { userId, params }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  adminGuard(me?.role ?? "")

  const user = await prisma.user.findUnique({
    where: { id: params.id, deletedAt: null },
    include: {
      _count: { select: { transactions: true, budgets: true, goals: true } },
    },
  })
  if (!user) throw new NotFoundError("Usuario", params.id)

  const [totalIncome, totalExpenses, recentTx, lastMonthTx] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId: params.id, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { userId: params.id, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.transaction.findMany({
      where: { userId: params.id },
      orderBy: { date: "desc" },
      take: 10,
      include: { category: true },
    }),
    prisma.transaction.count({
      where: {
        userId: params.id,
        date: { gte: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)) },
      },
    }),
  ])

  return success({
    ...user,
    password: undefined,
    stats: {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      balance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
      lastMonthTransactions: lastMonthTx,
    },
    recentTransactions: recentTx,
  })
})

export const PUT = withAuth(async (req, { userId, params }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  adminGuard(me?.role ?? "")

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

  await createAuditLog(userId, "UPDATE", "User", targetId, { changes: data })

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

  await createAuditLog(userId, "DELETE", "User", targetId)

  return success({ success: true })
})
