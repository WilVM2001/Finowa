"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BudgetDialog } from "./BudgetDialog"
import { formatCurrency } from "@/lib/utils"
import { Plus, AlertTriangle } from "lucide-react"
import { Budget } from "@/types"
import { useState } from "react"
import toast from "react-hot-toast"

interface Props {
  budgets: Budget[]
  totalIncome: number
  onRefresh: () => void
}

export function BudgetCard({ budgets, totalIncome, onRefresh }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este presupuesto?")) return
    const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Presupuesto eliminado")
      onRefresh()
    }
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Presupuestos</CardTitle>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-500">
                No hay presupuestos definidos
              </p>
            )}
            {budgets.map((budget, i) => {
              const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
              const isOverBudget = percentage > 100
              const isWarning = percentage > 80 && percentage <= 100

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: budget.category?.color }}
                      />
                      <span className="text-sm font-medium text-white">
                        {budget.category?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isOverBudget
                            ? "text-red-400"
                            : isWarning
                              ? "text-amber-400"
                              : "text-zinc-400"
                        }`}
                      >
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-zinc-600 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${
                      isOverBudget
                        ? "[&>div]:bg-red-500"
                        : isWarning
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-emerald-500"
                    }`}
                  />
                  {budget.percentage > 0 && (
                    <p className="mt-1 text-xs text-zinc-600">
                      {budget.percentage}% del ingreso
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <BudgetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onRefresh}
        totalIncome={totalIncome}
      />
    </>
  )
}
