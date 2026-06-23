"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, TrendingUp, AlertTriangle, Shield, Target, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Notification {
  id: string
  type: "warning" | "success" | "info" | "danger"
  title: string
  message: string
  timestamp: Date
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNotifications() {
    try {
      const [insightsRes, budgetsRes] = await Promise.all([
        fetch("/api/insights"),
        fetch("/api/budgets"),
      ])

      const notifs: Notification[] = []

      if (insightsRes.ok) {
        const insights = await insightsRes.json()
        const alertas = insights.insights
        if (alertas && Array.isArray(alertas)) {
          for (const a of alertas) {
            notifs.push({
              id: `insight-${a.title}`,
              type: a.type || "info",
              title: a.title,
              message: a.message,
              timestamp: new Date(),
            })
          }
        }
      }

      if (budgetsRes.ok) {
        const budgets = await budgetsRes.json()
        if (Array.isArray(budgets)) {
          for (const b of budgets) {
            if (b.spent > 0 && b.amount > 0) {
              const pct = (b.spent / b.amount) * 100
              if (pct >= 90) {
                notifs.push({
                  id: `budget-exceeded-${b.id}`,
                  type: "danger",
                  title: `Presupuesto excedido: ${b.category?.name}`,
                  message: `Has gastado ${formatCurrency(b.spent)} de ${formatCurrency(b.amount)} (${pct.toFixed(0)}%)`,
                  timestamp: new Date(),
                })
              } else if (pct >= 70) {
                notifs.push({
                  id: `budget-warning-${b.id}`,
                  type: "warning",
                  title: `Presupuesto cercano al límite: ${b.category?.name}`,
                  message: `Has gastado ${formatCurrency(b.spent)} de ${formatCurrency(b.amount)} (${pct.toFixed(0)}%)`,
                  timestamp: new Date(),
                })
              }
            }
          }
        }
      }

      setNotifications(notifs)
      setUnreadCount(notifs.length)
    } catch {
      // Silently fail for notifications
    }
  }

  const iconMap = {
    warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    success: <TrendingUp className="h-4 w-4 text-emerald-400" />,
    info: <Info className="h-4 w-4 text-blue-400" />,
    danger: <AlertTriangle className="h-4 w-4 text-red-400" />,
  }

  const bgMap = {
    warning: "bg-amber-500/10",
    success: "bg-emerald-500/10",
    info: "bg-blue-500/10",
    danger: "bg-red-500/10",
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open) setUnreadCount(0) }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">Notificaciones</h3>
              <span className="text-xs text-zinc-500">{notifications.length} alertas</span>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Shield className="h-8 w-8 text-emerald-400" />
                  <p className="text-sm text-zinc-400">Todo en orden</p>
                  <p className="text-xs text-zinc-600">No hay alertas por ahora</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-zinc-800/50 px-4 py-3 transition-colors hover:bg-zinc-900/50 ${bgMap[n.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{iconMap[n.type]}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
