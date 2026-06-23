"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function CtaSection() {
  const router = useRouter()

  return (
    <section className="relative z-10 border-t border-white/5 bg-black py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-12"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Comienza a tomar el control hoy
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Únete a miles de usuarios que ya gestionan sus finanzas de manera inteligente.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="w-full bg-white text-black hover:bg-zinc-200 sm:w-auto"
              onClick={() => router.push("/register")}
            >
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5 sm:w-auto"
              onClick={() => router.push("/login")}
            >
              Iniciar Sesión
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
