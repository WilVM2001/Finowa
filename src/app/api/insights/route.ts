import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"

export const GET = withAuth(async (req, { userId }) => {
  const now = new Date()
  const currentMonth = now.getUTCMonth() + 1
  const currentYear = now.getUTCFullYear()
  const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1))
  const startOfNextMonth = new Date(Date.UTC(currentYear, currentMonth, 1))

  const [income, expenses, txCount, categories, goals] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: startOfMonth, lt: startOfNextMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
    prisma.goal.findMany({ where: { userId } }),
  ])

  const totalIncome = income._sum.amount || 0
  const totalExpenses = expenses._sum.amount || 0
  const insights = []

  if (totalExpenses > 0 && totalIncome > 0) {
    const ratio = (totalExpenses / totalIncome) * 100
    if (ratio > 70) {
      insights.push({
        type: "warning",
        severity: "high",
        title: "Gastos elevados",
        message: `Tus gastos representan el ${ratio.toFixed(0)}% de tus ingresos. Se recomienda mantenerlo por debajo del 70%.`,
        action: "Revisar presupuestos",
      })
    } else if (ratio < 40) {
      insights.push({
        type: "success",
        severity: "low",
        title: "Buen control financiero",
        message: `Solo gastas el ${ratio.toFixed(0)}% de tus ingresos. Excelente disciplina financiera.`,
        action: "Considera invertir el excedente",
      })
    }
  }

  if (totalIncome > 0 && totalExpenses >= 0) {
    const savings = totalIncome - totalExpenses
    const savingsRate = (savings / totalIncome) * 100
    if (savingsRate >= 20) {
      insights.push({
        type: "success",
        severity: "low",
        title: "Tasa de ahorro saludable",
        message: `Estás ahorrando ${savingsRate.toFixed(0)}% de tus ingresos (${savings.toFixed(2)} COP).`,
        action: "Mantén este hábito",
      })
    } else if (savingsRate > 0) {
      insights.push({
        type: "info",
        severity: "medium",
        title: "Ahorro mejorable",
        message: `Tu tasa de ahorro es del ${savingsRate.toFixed(0)}%. El objetivo recomendado es 20%.`,
        action: "Ajusta tus presupuestos",
      })
    } else if (totalIncome > 0) {
      insights.push({
        type: "danger",
        severity: "high",
        title: "Déficit mensual",
        message: `Estás gastando ${Math.abs(savings).toFixed(2)} COP más de lo que ganas.`,
        action: "Revisa tus gastos urgentemente",
      })
    }
  }

  const lastMonth = new Date(Date.UTC(currentYear, currentMonth - 2, 1))
  const prevMonthExpenses = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: lastMonth, lt: startOfMonth },
    },
    _sum: { amount: true },
  })

  const prevAmount = prevMonthExpenses._sum.amount || 0
  if (prevAmount > 0 && totalExpenses > 0) {
    const change = ((totalExpenses - prevAmount) / prevAmount) * 100
    if (Math.abs(change) > 20) {
      insights.push({
        type: change > 0 ? "warning" : "success",
        severity: Math.abs(change) > 50 ? "high" : "medium",
        title: change > 0 ? "Gastos en aumento" : "Gastos en descenso",
        message: `Tus gastos ${change > 0 ? "aumentaron" : "disminuyeron"} un ${Math.abs(change).toFixed(0)}% vs el mes anterior.`,
        action: change > 0 ? "Revisa nuevas suscripciones o gastos" : "Sigue así",
      })
    }
  }

  const recentTransactions = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE" },
    orderBy: { date: "desc" },
    take: 100,
  })

  const subscriptionKeywords = ["netflix", "spotify", "disney", "prime", "hbo", "apple", "suscripc", "membres", "patreon", "onlyfans", "dropbox", "google one", "icloud"]
  const subscriptions = recentTransactions.filter((t) =>
    subscriptionKeywords.some((kw) => t.description.toLowerCase().includes(kw))
  )

  if (subscriptions.length >= 2) {
    const totalSubs = subscriptions.reduce((s, t) => s + t.amount, 0)
    const uniqueNames = [...new Set(subscriptions.map((t) => t.description))].slice(0, 5)
    insights.push({
      type: "info",
      severity: "medium",
      title: `${subscriptions.length} suscripciones activas`,
      message: `Gastas ${totalSubs.toFixed(2)} COP/mes en: ${uniqueNames.join(", ")}${subscriptions.length > 5 ? " y más..." : ""}`,
      action: "Revisa si todas son necesarias",
    })
  }

  const categoryExpenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfMonth, lt: startOfNextMonth },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 1,
  })

  if (categoryExpenses.length > 0 && totalExpenses > 0) {
    const topCategory = categoryExpenses[0]
    const category = categories.find((c) => c.id === topCategory.categoryId)
    const pct = (topCategory._sum.amount! / totalExpenses) * 100
    if (pct > 40) {
      insights.push({
        type: "warning",
        severity: "medium",
        title: `Gasto concentrado en ${category?.name || "una categoría"}`,
        message: `El ${pct.toFixed(0)}% de tus gastos está en esta categoría (${topCategory._sum.amount!.toFixed(2)} COP).`,
        action: "Diversifica o busca reducir este gasto",
      })
    }
  }

  if (goals.length > 0) {
    const goalsNeedingAttention = goals.filter(
      (g) => g.currentAmount / g.targetAmount < 0.3 && g.monthlyContribution === 0
    )
    if (goalsNeedingAttention.length > 0) {
      insights.push({
        type: "info",
        severity: "low",
        title: `${goalsNeedingAttention.length} meta(s) sin progreso`,
        message: `Tienes metas sin aportes mensuales configurados: ${goalsNeedingAttention.map((g) => g.name).join(", ")}`,
        action: "Configura aportes automáticos",
      })
    }
  }

  if (txCount === 0) {
    insights.push({
      type: "info",
      severity: "low",
      title: "Primeros pasos",
      message: "Comienza agregando tus ingresos y gastos para recibir análisis personalizados.",
      action: "Agregar transacciones",
    })
  }

  if (insights.length === 0) {
    insights.push({
      type: "success",
      severity: "low",
      title: "Todo en orden",
      message: "Tus finanzas se ven saludables. Sigue así.",
      action: null,
    })
  }

  return success({
    insights,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: txCount,
    subscriptionCount: subscriptions.length,
  })
})
