"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/Header"
import { BudgetCard } from "@/components/dashboard/BudgetCard"
import { Budget } from "@/types"

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadData() {
    setLoading(true)
    setError("")
    try {
      const [budgetsRes, summaryRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/summary"),
      ])
      if (!budgetsRes.ok || !summaryRes.ok) throw new Error("Error al cargar datos")
      setBudgets(await budgetsRes.json())
      const data = await summaryRes.json()
      setTotalIncome(data.totalIncome)
    } catch (e) {
      setError("No se pudieron cargar los presupuestos. Intenta de nuevo.")
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={loadData} className="text-sm text-indigo-400 hover:text-indigo-300">Reintentar</button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="p-6">
        <BudgetCard budgets={budgets} totalIncome={totalIncome} onRefresh={loadData} />
      </main>
    </div>
  )
}
