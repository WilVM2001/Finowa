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
import { Goal } from "@/types"
import toast from "react-hot-toast"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editGoal?: Goal | null
}

export function GoalDialog({ open, onOpenChange, onSuccess, editGoal }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    targetAmount: "",
    monthlyContribution: "",
    deadline: "",
  })

  useEffect(() => {
    if (editGoal) {
      setForm({
        name: editGoal.name,
        targetAmount: String(editGoal.targetAmount),
        monthlyContribution: String(editGoal.monthlyContribution),
        deadline: editGoal.deadline
          ? new Date(editGoal.deadline).toISOString().split("T")[0]
          : "",
      })
    } else {
      setForm({ name: "", targetAmount: "", monthlyContribution: "", deadline: "" })
    }
  }, [editGoal, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const method = editGoal ? "PUT" : "POST"
    const body = editGoal
      ? {
          id: editGoal.id,
          ...form,
          targetAmount: parseFloat(form.targetAmount),
          monthlyContribution: parseFloat(form.monthlyContribution) || 0,
          deadline: form.deadline || null,
        }
      : {
          ...form,
          targetAmount: parseFloat(form.targetAmount),
          monthlyContribution: parseFloat(form.monthlyContribution) || 0,
          deadline: form.deadline || null,
        }

    const res = await fetch("/api/goals", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      toast.success(editGoal ? "Meta actualizada" : "Meta creada")
      onSuccess()
      onOpenChange(false)
    } else {
      toast.error("Error al guardar")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle>{editGoal ? "Editar Meta" : "Nueva Meta Financiera"}</DialogTitle>
          <DialogDescription>
            Define un objetivo de ahorro para alcanzar tus metas
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Nombre de la meta</label>
            <Input
              placeholder="Ej: Viaje a Europa"
              className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Monto objetivo</label>
            <Input
              type="number"
              step="0.01"
              placeholder="100000"
              className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Aporte mensual recomendado</label>
            <Input
              type="number"
              step="0.01"
              placeholder="5000"
              className="border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600"
              value={form.monthlyContribution}
              onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Fecha límite (opcional)</label>
            <Input
              type="date"
              className="border-zinc-800 bg-zinc-900 text-white"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : editGoal ? "Actualizar Meta" : "Crear Meta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
