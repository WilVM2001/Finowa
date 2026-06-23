import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"

export const GET = withAuth(async (req, { userId }) => {
  const now = new Date()
  const currentMonth = now.getUTCMonth() + 1
  const currentYear = now.getUTCFullYear()

  const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1))
  const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth, 1))

  const [
    monthlyIncome,
    monthlyExpenses,
    allTransactions,
    categories,
    budgets,
    goals,
    totalIncomeAllTime,
    totalExpensesAllTime,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.category.findMany({ where: { userId } }),
    prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: true },
    }),
    prisma.goal.findMany({ where: { userId } }),
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ])

  const totalIncome = monthlyIncome._sum.amount || 0
  const totalExpenses = monthlyExpenses._sum.amount || 0
  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  const categoryBreakdownRaw = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _sum: { amount: true },
  })

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  const categoryBreakdown = categoryBreakdownRaw.map((item) => ({
    name: categoryMap.get(item.categoryId)?.name || "Otros",
    amount: item._sum.amount || 0,
    color: categoryMap.get(item.categoryId)?.color || "#71717a",
    icon: categoryMap.get(item.categoryId)?.icon || "circle",
  }))

  const incomeBreakdownRaw = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "INCOME",
      date: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _sum: { amount: true },
    _count: true,
  })

  const incomeBreakdown = incomeBreakdownRaw.map((item) => ({
    categoryId: item.categoryId,
    categoryName: categoryMap.get(item.categoryId)?.name || "Otros",
    categoryColor: categoryMap.get(item.categoryId)?.color || "#22c55e",
    categoryIcon: categoryMap.get(item.categoryId)?.icon || "briefcase",
    amount: item._sum.amount || 0,
    count: item._count,
  }))

  const monthlyTrend = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(currentYear, currentMonth - 1 - i, 1))
    const m = d.getUTCMonth() + 1
    const y = d.getUTCFullYear()

    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) },
        },
        _sum: { amount: true },
      }),
    ])

    monthlyTrend.push({
      month: `${m.toString().padStart(2, "0")}/${y}`,
      income: inc._sum.amount || 0,
      expenses: exp._sum.amount || 0,
    })
  }

  const thirtyDaysAgo = new Date(Date.UTC(currentYear, currentMonth - 1, now.getUTCDate() - 30))
  const incomesLast30 = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "INCOME",
      date: { gte: thirtyDaysAgo },
    },
    _sum: { amount: true },
  })

  const expensesLast30 = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: thirtyDaysAgo },
    },
    _sum: { amount: true },
  })

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spentAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: startOfMonth, lt: startOfNextMonth },
        },
        _sum: { amount: true },
      })
      return { ...budget, spent: spentAgg._sum.amount || 0 }
    })
  )

  return success({
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    incomeCount: monthlyIncome._count,
    expenseCount: monthlyExpenses._count,
    transactions: allTransactions,
    budgets: budgetsWithSpent,
    goals,
    monthlyTrend,
    categoryBreakdown,
    incomeBreakdown,
    allTimeIncome: totalIncomeAllTime._sum.amount || 0,
    allTimeExpenses: totalExpensesAllTime._sum.amount || 0,
    last30DaysIncome: incomesLast30._sum.amount || 0,
    last30DaysExpenses: expensesLast30._sum.amount || 0,
    highestExpenseCategory: categoryBreakdown.length > 0
      ? categoryBreakdown.reduce((max, c) => (c.amount > max.amount ? c : max))
      : null,
  })
})
