"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || "Error al registrarse")
      setLoading(false)
      return
    }

    toast.success("Cuenta creada exitosamente")
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-950/20 via-black to-purple-950/20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="text-xl font-bold text-white">F</span>
            </div>
            <CardTitle className="text-xl text-white">Crear Cuenta</CardTitle>
            <CardDescription>Comienza a gestionar tus finanzas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Tu nombre"
                    className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-600"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="tu@correo.com"
                    className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-600"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="border-zinc-800 bg-zinc-900 pl-10 text-white placeholder:text-zinc-600"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-zinc-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                Iniciar Sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
