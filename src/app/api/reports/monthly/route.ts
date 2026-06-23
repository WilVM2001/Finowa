import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"

export const GET = withAuth(async (req, { userId }) => {
  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const report = await Promise.all(
    months.map(async (month) => {
      const start = new Date(Date.UTC(year, month - 1, 1))
      const end = new Date(Date.UTC(year, month, 1))

      const [income, expenses, txCount, categoryData] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: "INCOME", date: { gte: start, lt: end } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
          _sum: { amount: true },
        }),
        prisma.transaction.count({
          where: { userId, date: { gte: start, lt: end } },
        }),
        prisma.transaction.groupBy({
          by: ["categoryId"],
          where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
          _sum: { amount: true },
        }),
      ])

      const totalIncome = income._sum.amount || 0
      const totalExpenses = expenses._sum.amount || 0

      return {
        month,
        income: totalIncome,
        expenses: totalExpenses,
        balance: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
        transactionCount: txCount,
        categoryCount: categoryData.length,
      }
    })
  )

  const annualSummary = report.reduce(
    (acc, m) => ({
      totalIncome: acc.totalIncome + m.income,
      totalExpenses: acc.totalExpenses + m.expenses,
      totalTransactions: acc.totalTransactions + m.transactionCount,
      averageSavingsRate: acc.averageSavingsRate + m.savingsRate,
    }),
    { totalIncome: 0, totalExpenses: 0, totalTransactions: 0, averageSavingsRate: 0 }
  )

  annualSummary.averageSavingsRate = annualSummary.averageSavingsRate / 12

  return success({
    year,
    months: report,
    summary: annualSummary,
  })
})
