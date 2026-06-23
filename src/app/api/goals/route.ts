import { prisma } from "@/lib/prisma"
import { withAuth, success, parseBody, ApiError } from "@/lib/api-utils"
import { goalSchema, goalUpdateSchema } from "@/lib/validations"

export const GET = withAuth(async (req, { userId }) => {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return success(goals)
})

export const POST = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = goalSchema.parse(body)

  const goal = await prisma.goal.create({
    data: {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      monthlyContribution: data.monthlyContribution || 0,
      deadline: data.deadline ? new Date(data.deadline) : null,
      icon: data.icon,
      color: data.color,
      userId,
    },
  })

  return success(goal, 201)
})

export const PUT = withAuth(async (req, { userId }) => {
  const body = await parseBody(req)
  const data = goalUpdateSchema.parse(body)

  const existing = await prisma.goal.findFirst({
    where: { id: data.id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "GOAL_NOT_FOUND", "Meta no encontrada")
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.targetAmount !== undefined) updateData.targetAmount = data.targetAmount
  if (data.currentAmount !== undefined) updateData.currentAmount = data.currentAmount
  if (data.monthlyContribution !== undefined) updateData.monthlyContribution = data.monthlyContribution
  if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color

  const goal = await prisma.goal.update({
    where: { id: data.id },
    data: updateData,
  })

  return success(goal)
})

export const DELETE = withAuth(async (req, { userId }) => {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  if (!id) {
    throw new ApiError(400, "MISSING_ID", "ID de meta requerido")
  }

  const existing = await prisma.goal.findFirst({
    where: { id, userId },
  })

  if (!existing) {
    throw new ApiError(404, "GOAL_NOT_FOUND", "Meta no encontrada")
  }

  await prisma.goal.delete({ where: { id } })

  return success({ success: true })
})
