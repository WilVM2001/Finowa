"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"

interface SummaryData {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
}

const cards = [
  {
    key: "balance",
    label: "Balance Total",
    icon: Wallet,
    color: "from-indigo-500 to-purple-600",
    textColor: "text-indigo-400",
  },
  {
    key: "income",
    label: "Ingresos",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-400",
  },
  {
    key: "expenses",
    label: "Gastos",
    icon: TrendingDown,
    color: "from-red-500 to-rose-600",
    textColor: "text-red-400",
  },
  {
    key: "savings",
    label: "Ahorro",
    icon: PiggyBank,
    color: "from-cyan-500 to-blue-600",
    textColor: "text-cyan-400",
  },
]

export function SummaryCards({ data }: { data: SummaryData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        let value = 0
        let isNegative = false
        switch (card.key) {
          case "balance":
            value = data.balance
            isNegative = value < 0
            break
          case "income":
            value = data.totalIncome
            break
          case "expenses":
            value = data.totalExpenses
            break
          case "savings":
            value = data.savingsRate
            break
        }

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="border-zinc-800 bg-zinc-950/50 backdrop-blur-sm transition-all hover:border-zinc-700">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg bg-gradient-to-br ${card.color} p-2`}>
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-zinc-500">{card.label}</p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      card.key === "expenses"
                        ? "text-red-400"
                        : card.key === "savings"
                          ? "text-cyan-400"
                          : isNegative
                            ? "text-red-400"
                            : "text-white"
                    }`}
                  >
                    {card.key === "savings"
                      ? `${value.toFixed(1)}%`
                      : formatCurrency(value)}
                  </p>
                </div>
                {card.key === "savings" && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                      style={{ width: `${Math.min(value, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
