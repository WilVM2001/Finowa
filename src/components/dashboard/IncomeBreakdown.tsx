"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Category } from "@/types"
import { TrendingUp, ArrowUpRight } from "lucide-react"

interface IncomeSource {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  amount: number
  count: number
}

interface Props {
  totalIncome: number
  sources: IncomeSource[]
}

export function IncomeBreakdown({ totalIncome, sources }: Props) {
  if (sources.length === 0) return null

  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Ingresos del Mes
          </CardTitle>
          <span className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sources
            .sort((a, b) => b.amount - a.amount)
            .map((source, i) => (
              <motion.div
                key={source.categoryId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between rounded-lg border border-zinc-800/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: source.categoryColor + "20" }}
                  >
                    <ArrowUpRight className="h-4 w-4" style={{ color: source.categoryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{source.categoryName}</p>
                    <p className="text-xs text-zinc-500">{source.count} transacciones</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">{formatCurrency(source.amount)}</p>
                  <p className="text-xs text-zinc-600">
                    {totalIncome > 0 ? ((source.amount / totalIncome) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            {sources
              .sort((a, b) => b.amount - a.amount)
              .map((source, i) => {
                const colors = ["#22c55e", "#3b82f6", "#a855f7", "#06b6d4"]
                return (
                  <div
                    key={source.categoryId}
                    className="h-full float-left first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${totalIncome > 0 ? (source.amount / totalIncome) * 100 : 0}%`,
                      backgroundColor: colors[i % colors.length],
                    }}
                  />
                )
              })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {sources
              .sort((a, b) => b.amount - a.amount)
              .map((source, i) => {
                const colors = ["#22c55e", "#3b82f6", "#a855f7", "#06b6d4"]
                return (
                  <div key={source.categoryId} className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                    {source.categoryName}
                  </div>
                )
              })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
