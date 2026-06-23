"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/dashboard/Header"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { TransactionsList } from "@/components/dashboard/TransactionsList"
import { BudgetCard } from "@/components/dashboard/BudgetCard"
import { FinancialInsights } from "@/components/dashboard/FinancialInsights"
import { GoalsList } from "@/components/dashboard/GoalsList"
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts"
import { IncomeBreakdown } from "@/components/dashboard/IncomeBreakdown"
import { FinancialSummary } from "@/types"

export default function DashboardPage() {
  const [data, setData] = useState<FinancialSummary | null>(null)
  const [error, setError] = useState("")

  async function loadData() {
    setError("")
    try {
      const summaryRes = await fetch("/api/summary")
      if (!summaryRes.ok) throw new Error("Error al cargar")
      const summary = await summaryRes.json()

      let insightsData = null
      try {
        const insightsRes = await fetch("/api/insights")
        if (insightsRes.ok) insightsData = await insightsRes.json()
      } catch {}

      setData({ ...summary, insights: insightsData })
    } catch {
      setError("No se pudo cargar el resumen financiero.")
    }
  }

  useEffect(() => { loadData() }, [])

  if (!data) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        {error ? (
          <main className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={loadData} className="text-sm text-indigo-400 hover:text-indigo-300">Reintentar</button>
          </main>
        ) : (
          <main className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
          </main>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SummaryCards data={data} />
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionsList transactions={data.transactions} onRefresh={loadData} />
          <BudgetCard budgets={data.budgets} totalIncome={data.totalIncome} onRefresh={loadData} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnalyticsCharts
              monthlyTrend={data.monthlyTrend}
              categoryBreakdown={data.categoryBreakdown}
            />
          </div>
          <FinancialInsights
            totalIncome={data.totalIncome}
            totalExpenses={data.totalExpenses}
            savingsRate={data.savingsRate}
            transactions={data.transactions}
            goals={data.goals}
          />
        </div>

        {(data as any).incomeBreakdown?.length > 0 && (
          <IncomeBreakdown
            totalIncome={data.totalIncome}
            sources={(data as any).incomeBreakdown}
          />
        )}

        <GoalsList goals={data.goals} onRefresh={loadData} />
      </main>
    </div>
  )
}
