"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GoalDialog } from "./GoalDialog"
import { Goal } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Plus, Pencil, Trash2, Target } from "lucide-react"
import toast from "react-hot-toast"

interface Props {
  goals: Goal[]
  onRefresh: () => void
}

export function GoalsList({ goals, onRefresh }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta meta?")) return
    const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Meta eliminada")
      onRefresh()
    }
  }

  return (
    <>
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Metas Financieras</CardTitle>
            <Button size="sm" onClick={() => { setEditGoal(null); setDialogOpen(true) }}>
              <Plus className="mr-1 h-4 w-4" /> Nueva Meta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <Target className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
                <p className="text-sm text-zinc-500">
                  Crea tu primera meta financiera
                </p>
              </div>
            )}
            {goals.map((goal, i) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const monthsToGoal =
                goal.monthlyContribution > 0
                  ? Math.ceil(
                      (goal.targetAmount - goal.currentAmount) /
                        goal.monthlyContribution
                    )
                  : null

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${goal.color}20` }}
                          >
                            <Target className="h-5 w-5" style={{ color: goal.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {goal.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {formatCurrency(goal.currentAmount)} /{" "}
                              {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditGoal(goal)
                              setDialogOpen(true)
                            }}
                            className="text-zinc-600 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="text-zinc-600 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Progress
                          value={Math.min(progress, 100)}
                          className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-600"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                          <span>{Math.min(progress, 100).toFixed(0)}%</span>
                          {monthsToGoal && (
                            <span>
                              {monthsToGoal > 12
                                ? `~${Math.floor(monthsToGoal / 12)} años`
                                : `${monthsToGoal} meses`}
                            </span>
                          )}
                        </div>
                      </div>

                      {goal.monthlyContribution > 0 && (
                        <p className="mt-2 text-xs text-zinc-600">
                          Aporte mensual: {formatCurrency(goal.monthlyContribution)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={onRefresh}
        editGoal={editGoal}
      />
    </>
  )
}
