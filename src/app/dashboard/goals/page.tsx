"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/Header"
import { GoalsList } from "@/components/dashboard/GoalsList"
import { Goal } from "@/types"

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadGoals() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/goals")
      if (!res.ok) throw new Error("Error")
      setGoals(await res.json())
    } catch {
      setError("No se pudieron cargar las metas.")
    }
    setLoading(false)
  }

  useEffect(() => { loadGoals() }, [])

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
          <button onClick={loadGoals} className="text-sm text-indigo-400 hover:text-indigo-300">Reintentar</button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="p-6">
        <GoalsList goals={goals} onRefresh={loadGoals} />
      </main>
    </div>
  )
}
