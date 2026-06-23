"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  Target,
  TrendingDown,
  Brain,
  Shield,
  Download,
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description:
      "Visualiza tus finanzas con gráficos interactivos y análisis predictivo de tus gastos e ingresos mensuales.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: Target,
    title: "Metas Financieras",
    description:
      "Establece objetivos de ahorro y sigue tu progreso en tiempo real con recomendaciones personalizadas.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: TrendingDown,
    title: "Presupuestos Dinámicos",
    description:
      "Límites inteligentes que se ajustan automáticamente según tus ingresos y patrones de gasto.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Brain,
    title: "IA Financiera",
    description:
      "Detección de gastos excesivos, patrones de consumo y sugerencias de ahorro con machine learning.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "Seguridad Bancaria",
    description:
      "Encriptación de nivel bancario y autenticación segura para proteger tus datos financieros.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: Download,
    title: "Importación CSV",
    description:
      "Importa tus transacciones bancarias y exporta reportes PDF profesionales automáticamente.",
    gradient: "from-orange-500 to-red-600",
  },
]

export function Features() {
  return (
    <section id="features" className="relative z-10 border-t border-white/5 bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Todo lo que necesitas para{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              gestionar tu dinero
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            Una plataforma completa con herramientas profesionales para el control financiero personal.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
