"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { Category } from "@/types"
import toast from "react-hot-toast"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  totalIncome: number
}

export function BudgetDialog({ open, onOpenChange, onSuccess, totalIncome }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [usePercentage, setUsePercentage] = useState(true)
  const [form, setForm] = useState({
    categoryId: "",
    percentage: "",
    amount: "",
  })

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((cats) => {
      setCategories(cats.filter((c: Category) => c.type === "EXPENSE"))
    })
  }, [])

  useEffect(() => {
    if (!open) {
      setForm({ categoryId: "", percentage: "", amount: "" })
      setUsePercentage(true)
    }
  }, [open])

  useEffect(() => {
    if (usePercentage && form.percentage && totalIncome > 0) {
      const pct = parseFloat(form.percentage) / 100
      setForm((prev) => ({ ...prev, amount: (totalIncome * pct).toFixed(2) }))
    }
  }, [form.percentage, totalIncome, usePercentage])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) {
      toast.error("El monto debe ser mayor a 0")
      setLoading(false)
      return
    }

    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: form.categoryId,
        amount,
        percentage: usePercentage ? parseFloat(form.percentage) : ((amount / totalIncome) * 100 || 0),
      }),
    })

    if (res.ok) {
      toast.success("Presupuesto creado")
      onSuccess()
      onOpenChange(false)
    } else {
      toast.error("Error al crear presupuesto")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>Nuevo Presupuesto</DialogTitle>
          <DialogDescription>
            Define un presupuesto para una categoría de gasto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Categoría</label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
              required
            >
              <SelectTrigger className="border-zinc-800 bg-zinc-900 text-white">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <button
              type="button"
              onClick={() => setUsePercentage(true)}
              className={`rounded px-2 py-1 ${usePercentage ? "bg-indigo-500/20 text-indigo-400" : "hover:text-zinc-300"}`}
            >
              Por porcentaje
            </button>
            <button
              type="button"
              onClick={() => setUsePercentage(false)}
              className={`rounded px-2 py-1 ${!usePercentage ? "bg-indigo-500/20 text-indigo-400" : "hover:text-zinc-300"}`}
            >
              Monto fijo
            </button>
          </div>

          {usePercentage ? (
            <div>
              <label className="text-sm text-zinc-400">
                Porcentaje del ingreso (%) — Ingreso actual: {formatCurrency(totalIncome)}
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ej: 20"
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                required
              />
              <p className="mt-1 text-xs text-zinc-600">
                Monto: {formatCurrency(parseFloat(form.amount) || 0)}
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm text-zinc-400">Monto fijo</label>
              <Input
                type="number"
                step="1"
                placeholder="0"
                className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
              {totalIncome > 0 && parseFloat(form.amount) > 0 && (
                <p className="mt-1 text-xs text-zinc-600">
                  {((parseFloat(form.amount) / totalIncome) * 100).toFixed(1)}% del ingreso
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Crear Presupuesto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
