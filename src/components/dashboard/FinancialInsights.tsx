"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
} from "lucide-react"

interface Props {
  totalIncome: number
  totalExpenses: number
  savingsRate: number
  transactions: any[]
  goals: any[]
}

export function FinancialInsights({
  totalIncome,
  totalExpenses,
  savingsRate,
  transactions,
  goals,
}: Props) {
  const insights = []

  if (totalExpenses > totalIncome * 0.7) {
    insights.push({
      type: "warning",
      icon: AlertTriangle,
      title: "Gastos elevados",
      description: `Tus gastos representan ${((totalExpenses / totalIncome) * 100).toFixed(0)}% de tus ingresos. Intenta reducirlos.`,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    })
  }

  if (savingsRate > 0) {
    insights.push({
      type: "success",
      icon: TrendingUp,
      title: "Buena tasa de ahorro",
      description: `Estás ahorrando un ${savingsRate.toFixed(0)}% de tus ingresos. ¡Sigue así!`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    })
  }

  if (savingsRate <= 0 && totalIncome > 0) {
    insights.push({
      type: "danger",
      icon: TrendingDown,
      title: "Déficit mensual",
      description: "Estás gastando más de lo que ganas. Revisa tus presupuestos.",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    })
  }

  const suscriptionPayments = transactions.filter((t) => {
    const desc = t.description.toLowerCase()
    return (
      desc.includes("netflix") ||
      desc.includes("spotify") ||
      desc.includes("disney") ||
      desc.includes("prime") ||
      desc.includes("suscrip") ||
      desc.includes("membres")
    )
  })

  if (suscriptionPayments.length > 0) {
    const totalSubs = suscriptionPayments.reduce((s: number, t: any) => s + t.amount, 0)
    insights.push({
      type: "info",
      icon: Lightbulb,
      title: "Suscripciones detectadas",
      description: `Gastas ${formatCurrency(totalSubs)}/mes en suscripciones (${suscriptionPayments.length} servicios).`,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    })
  }

  if (goals.length > 0) {
    const nearestGoal = goals.reduce((closest: any, g: any) => {
      const progress = g.currentAmount / g.targetAmount
      const closestProgress = closest ? closest.currentAmount / closest.targetAmount : 0
      return progress > closestProgress ? g : closest
    }, null)

    if (nearestGoal) {
      insights.push({
        type: "goal",
        icon: Target,
        title: `Meta más cercana: ${nearestGoal.name}`,
        description: `Completada al ${((nearestGoal.currentAmount / nearestGoal.targetAmount) * 100).toFixed(0)}%`,
        color: "text-indigo-400",
        bgColor: "bg-indigo-500/10",
      })
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader>
        <CardTitle>Inteligencia Financiera</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-500">
              Agrega transacciones para recibir análisis inteligentes
            </p>
          )}
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-3 rounded-lg ${insight.bgColor} p-3`}
            >
              <insight.icon className={`mt-0.5 h-5 w-5 ${insight.color}`} />
              <div>
                <p className={`text-sm font-medium ${insight.color}`}>
                  {insight.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{insight.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
