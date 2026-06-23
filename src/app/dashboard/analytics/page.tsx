"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/Header"
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default function AnalyticsPage() {
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState("")
  const [monthlyReport, setMonthlyReport] = useState<any>(null)

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, reportRes] = await Promise.all([
          fetch("/api/summary"),
          fetch("/api/reports/monthly"),
        ])
        if (!summaryRes.ok) throw new Error("Error")
        const summary = await summaryRes.json()
        setMonthlyTrend(summary.monthlyTrend)
        setCategoryBreakdown(summary.categoryBreakdown)

        if (reportRes.ok) {
          setMonthlyReport(await reportRes.json())
        }
        setLoaded(true)
      } catch {
        setError("No se pudieron cargar los datos de análisis.")
        setLoaded(true)
      }
    }
    load()
  }, [])

  if (!loaded) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
        </main>
      </div>
    )
  }

  if (error && !monthlyTrend.length) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-indigo-400 hover:text-indigo-300">Reintentar</button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="space-y-6 p-6">
        <AnalyticsCharts monthlyTrend={monthlyTrend} categoryBreakdown={categoryBreakdown} />

        {monthlyReport && monthlyReport.months && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {monthlyReport.months.filter((m: any) => m.transactionCount > 0).map((m: any) => {
              const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
              return (
                <Card key={m.month} className="border-zinc-800 bg-zinc-950/50">
                  <CardContent className="p-4">
                    <p className="text-xs text-zinc-500">{monthNames[m.month - 1]}</p>
                    <p className="mt-1 text-lg font-bold text-white">{formatCurrency(m.income)}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-red-400">{formatCurrency(m.expenses)} gastos</span>
                      <span className="text-zinc-600">•</span>
                      <span className={m.balance >= 0 ? "text-emerald-400" : "text-red-400"}>
                        {formatCurrency(m.balance)}
                      </span>
                    </div>
                    {m.savingsRate > 0 && (
                      <div className="mt-2 h-1 w-full rounded-full bg-zinc-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(m.savingsRate, 100)}%` }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {monthlyReport && monthlyReport.summary && (
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Resumen Anual {monthlyReport.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-zinc-500">Ingreso total</p>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(monthlyReport.summary.totalIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Gasto total</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(monthlyReport.summary.totalExpenses)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Balance</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(monthlyReport.summary.totalIncome - monthlyReport.summary.totalExpenses)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Transacciones</p>
                  <p className="text-xl font-bold text-indigo-400">{monthlyReport.summary.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
