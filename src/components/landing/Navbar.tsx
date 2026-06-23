"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Características", href: "#features" },
  { label: "Ventajas", href: "#cta" },
  { label: "Demo", href: "/login" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <span className="text-lg font-semibold text-white">Finanza</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => router.push("/login")}>
            Iniciar Sesión
          </Button>
          <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => router.push("/register")}>
            Crear Cuenta
          </Button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/5 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col space-y-2 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" className="text-zinc-300 hover:text-white" onClick={() => router.push("/login")}>
                  Iniciar Sesión
                </Button>
                <Button className="bg-white text-black hover:bg-zinc-200" onClick={() => router.push("/register")}>
                  Crear Cuenta
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
