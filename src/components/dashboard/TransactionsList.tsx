"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TransactionDialog } from "./TransactionDialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Square, CheckSquare, MinusSquare } from "lucide-react"
import { Transaction, Category } from "@/types"
import toast from "react-hot-toast"

interface Props {
  transactions: Transaction[]
  onRefresh: () => void
  categories?: Category[]
}

export function TransactionsList({ transactions, onRefresh, categories = [] }: Props) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "ALL" || t.type === typeFilter
    const matchesCategory = categoryFilter === "ALL" || t.categoryId === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  const filteredIds = new Set(filtered.map((t) => t.id))
  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id))
  const someSelected = filtered.some((t) => selected.has(t.id))
  const selectedCount = Array.from(selected).filter((id) => filteredIds.has(id)).length

  function toggleSelectAll() {
    const newSelected = new Set(selected)
    if (allSelected) {
      for (const t of filtered) newSelected.delete(t.id)
    } else {
      for (const t of filtered) newSelected.add(t.id)
    }
    setSelected(newSelected)
  }

  function toggleOne(id: string) {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelected(newSelected)
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return
    const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Transacción eliminada")
      onRefresh()
    }
  }

  async function handleDeleteSelected() {
    const ids = Array.from(selected).filter((id) => filteredIds.has(id))
    if (ids.length === 0) return
    if (!confirm(`¿Eliminar ${ids.length} transacciones seleccionadas?`)) return

    setDeleting(true)
    try {
      const res = await fetch("/api/transactions/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.count} transacciones eliminadas`)
        setSelected(new Set())
        onRefresh()
      } else {
        toast.error("Error al eliminar")
      }
    } catch {
      toast.error("Error de conexión")
    }
    setDeleting(false)
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Transacciones</CardTitle>
              {selectedCount > 0 && (
                <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">
                  {selectedCount} seleccionadas
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={deleting}
                  className="h-8 text-xs"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  {deleting ? "Eliminando..." : `Eliminar (${selectedCount})`}
                </Button>
              )}
              <Button size="sm" onClick={() => { setEditTx(null); setDialogOpen(true) }}>
                <Plus className="mr-1 h-4 w-4" /> Nueva
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Buscar transacciones..."
                className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 border-zinc-800 bg-zinc-900 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="INCOME">Ingresos</SelectItem>
                <SelectItem value="EXPENSE">Gastos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44 border-zinc-800 bg-zinc-900 text-white">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                <SelectItem value="ALL">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-indigo-400" />
                ) : someSelected ? (
                  <MinusSquare className="h-4 w-4 text-indigo-400/60" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {allSelected ? "Deseleccionar todas" : "Seleccionar todas"}
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all hover:border-zinc-700 ${
                    selected.has(t.id) ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleOne(t.id)}
                      className="shrink-0 text-zinc-600 hover:text-indigo-400"
                    >
                      {selected.has(t.id) ? (
                        <CheckSquare className="h-5 w-5 text-indigo-400" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        t.type === "INCOME"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {t.type === "INCOME" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{formatDate(t.date)}</span>
                        {t.category && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: t.category.color }}
                              />
                              {t.category.name}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        t.type === "INCOME" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </span>
                    <button
                      onClick={() => { setEditTx(t); setDialogOpen(true) }}
                      className="text-zinc-600 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">
                No hay transacciones aún
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onRefresh}
        editTransaction={editTx}
      />
    </>
  )
}
