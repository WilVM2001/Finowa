"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/Header"
import { TransactionsList } from "@/components/dashboard/TransactionsList"
import { Transaction, Category } from "@/types"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadAll() {
    setLoading(true)
    setError("")
    try {
      const [txRes, catRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories"),
      ])
      if (!txRes.ok) throw new Error("Error al cargar transacciones")
      const txJson = await txRes.json()
      setTransactions(txJson.data ?? [])

      if (catRes.ok) setCategories(await catRes.json())
    } catch {
      setError("No se pudieron cargar las transacciones.")
    }
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

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

  if (error && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={loadAll} className="text-sm text-indigo-400 hover:text-indigo-300">Reintentar</button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="p-6">
        <TransactionsList transactions={transactions} onRefresh={loadAll} categories={categories} />
      </main>
    </div>
  )
}
