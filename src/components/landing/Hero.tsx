"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const stats = [
  { icon: Shield, value: "99.9%", label: "Disponibilidad" },
  { icon: TrendingUp, value: "$2.4B+", label: "Gestionados" },
  { icon: Zap, value: "50K+", label: "Usuarios Activos" },
]

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-16">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            Inteligencia Financiera en Tiempo Real
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Controla tus{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Finanzas
          </span>{" "}
          con Inteligencia
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          La plataforma financiera que utiliza IA para optimizar tus ahorros,
          presupuestos y metas financieras. Todo en un dashboard elegantemente diseñado.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            className="w-full bg-white text-black hover:bg-zinc-200 sm:w-auto"
            onClick={() => router.push("/register")}
          >
            Comenzar Gratis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-white/10 text-white hover:bg-white/5 sm:w-auto"
            onClick={() => router.push("/login")}
          >
            Ver Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-12"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                <stat.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
