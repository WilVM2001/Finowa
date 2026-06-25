import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"
import { ApiError, NotFoundError } from "@/lib/errors"
import { createAuditLog } from "@/lib/audit"

export const POST = withAuth(async (req, { userId, params }) => {
  const me = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (!me || me.role !== "SUPER_ADMIN") {
    throw new ApiError(403, "FORBIDDEN", "Solo Super Admin puede eliminar cuentas permanentemente")
  }

  const targetId = params.id

  const target = await prisma.user.findUnique({ where: { id: targetId } })
  if (!target) throw new NotFoundError("Usuario", targetId)

  // Obtener conteo antes de eliminar para auditoría
  const [txCount, budgetCount, goalCount, categoryCount] = await Promise.all([
    prisma.transaction.count({ where: { userId: targetId } }),
    prisma.budget.count({ where: { userId: targetId } }),
    prisma.goal.count({ where: { userId: targetId } }),
    prisma.category.count({ where: { userId: targetId } }),
  ])

  // Eliminar en orden para respetar constraints, o simplemente borrar el usuario
  // (el cascade onDelete de Prisma se encarga de todo)
  await prisma.user.delete({ where: { id: targetId } })

  await createAuditLog(userId, "PURGE", "User", targetId, {
    email: target.email,
    deleted: { transactions: txCount, budgets: budgetCount, goals: goalCount, categories: categoryCount },
  })

  return success({
    success: true,
    deleted: { transactions: txCount, budgets: budgetCount, goals: goalCount, categories: categoryCount },
    email: target.email,
  })
})
