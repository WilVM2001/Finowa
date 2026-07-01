"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Moon, Sun, User, Settings, Shield, LogOut } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NotificationsDropdown } from "./NotificationsDropdown"
import { useTheme } from "@/providers/ThemeProvider"

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN"

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const menuItems = [
    { label: "Configuración", icon: Settings, href: "/dashboard/settings", visible: true },
    { label: "Panel Admin", icon: Shield, href: "/admin", visible: isAdmin },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold text-white">
          Buenas {session?.user?.name?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-sm text-zinc-500">Aquí está tu resumen financiero</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <NotificationsDropdown />

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white hover:ring-2 hover:ring-indigo-400/50"
          >
            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-2xl"
              >
                <div className="border-b border-zinc-800 px-4 py-3">
                  <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{session?.user?.email}</p>
                  {isAdmin && (
                    <span className="mt-1 inline-block rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                      {session?.user?.role}
                    </span>
                  )}
                </div>

                <div className="py-1">
                  {menuItems
                    .filter((item) => item.visible)
                    .map((item) => (
                      <button
                        key={item.href}
                        onClick={() => { router.push(item.href); setMenuOpen(false) }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                </div>

                <div className="border-t border-zinc-800 py-1">
                  <button
                    onClick={() => { import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/" })) }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-zinc-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
