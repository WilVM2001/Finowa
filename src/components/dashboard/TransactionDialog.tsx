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
import { Category } from "@/types"
import toast from "react-hot-toast"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editTransaction?: any
}

export function TransactionDialog({ open, onOpenChange, onSuccess, editTransaction }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    amount: "",
    description: "",
    type: "EXPENSE",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (editTransaction) {
      setForm({
        amount: String(editTransaction.amount),
        description: editTransaction.description,
        type: editTransaction.type,
        categoryId: editTransaction.categoryId,
        date: new Date(editTransaction.date).toISOString().split("T")[0],
      })
    } else {
      setForm({
        amount: "",
        description: "",
        type: "EXPENSE",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
      })
    }
  }, [editTransaction, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const method = editTransaction ? "PUT" : "POST"
    const body = editTransaction
      ? { id: editTransaction.id, ...form, amount: parseFloat(form.amount) }
      : { ...form, amount: parseFloat(form.amount) }

    const res = await fetch("/api/transactions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast.success(editTransaction ? "Transacción actualizada" : "Transacción creada")
      onSuccess()
      onOpenChange(false)
    } else {
      toast.error("Error al guardar")
    }
    setLoading(false)
  }

  const filteredCategories = categories.filter((c) => c.type === form.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>
            {editTransaction ? "Editar Transacción" : "Nueva Transacción"}
          </DialogTitle>
          <DialogDescription>
            {editTransaction
              ? "Modifica los detalles de la transacción"
              : "Agrega un nuevo ingreso o gasto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={form.type === "INCOME" ? "default" : "outline"}
              className={form.type === "INCOME" ? "bg-emerald-600 hover:bg-emerald-700" : "border-zinc-700"}
              onClick={() => setForm({ ...form, type: "INCOME", categoryId: "" })}
            >
              Ingreso
            </Button>
            <Button
              type="button"
              variant={form.type === "EXPENSE" ? "default" : "outline"}
              className={form.type === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : "border-zinc-700"}
              onClick={() => setForm({ ...form, type: "EXPENSE", categoryId: "" })}
            >
              Gasto
            </Button>
          </div>

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
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Monto</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Descripción</label>
            <Input
              type="text"
              placeholder="Descripción de la transacción"
              className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Fecha</label>
            <Input
              type="date"
              className="border-zinc-800 bg-zinc-900 text-white"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Guardando..." : editTransaction ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
