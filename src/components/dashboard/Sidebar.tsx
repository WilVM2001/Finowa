"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "./DashboardLayoutClient"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Resumen" },
  { href: "/dashboard/transactions", icon: ArrowLeftRight, label: "Transacciones" },
  { href: "/dashboard/budgets", icon: PiggyBank, label: "Presupuestos" },
  { href: "/dashboard/goals", icon: Target, label: "Metas" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Análisis" },
  { href: "/dashboard/settings", icon: Settings, label: "Configuración" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <span className="text-sm font-bold text-white">F</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-semibold text-white"
            >
              Finanza
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-2">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "w-full text-zinc-400 hover:text-white",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" /> Colapsar
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "mt-1 w-full text-zinc-400 hover:text-red-400",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  )
}
