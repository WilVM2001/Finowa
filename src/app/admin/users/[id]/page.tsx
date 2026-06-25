"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowLeft, Shield, ShieldAlert, UserX, UserCheck, Key, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import toast from "react-hot-toast"

export default function UserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resetPass, setResetPass] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => { loadUser() }, [id])

  async function loadUser() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setAdminNotes(data.adminNotes || "")
      }
    } catch { toast.error("Error al cargar usuario") }
    setLoading(false)
  }

  async function handleUpdate(data: any) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (res.ok) { toast.success("Usuario actualizado"); loadUser() }
    else toast.error("Error al actualizar")
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (resetPass.length < 8) { toast.error("Mínimo 8 caracteres"); return }
    const res = await fetch(`/api/admin/users/${id}/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: resetPass }),
    })
    if (res.ok) { toast.success("Contraseña restablecida"); setResetPass(""); setShowReset(false) }
    else toast.error("Error")
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="p-6">
        <p className="text-red-400">Usuario no encontrado</p>
        <Button size="sm" variant="ghost" className="mt-2" onClick={() => router.push("/admin/users")}>
          Volver
        </Button>
      </main>
    )
  }

  const roleBadge = (r: string) => {
    if (r === "SUPER_ADMIN") return <Badge className="bg-red-500/20 text-red-400">Super Admin</Badge>
    if (r === "ADMIN") return <Badge className="bg-amber-500/20 text-amber-400">Admin</Badge>
    return <Badge className="bg-zinc-500/20 text-zinc-400">Usuario</Badge>
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Detalle de Usuario</h1>
      </div>

      {/* Info general */}
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ${
                user.role === "SUPER_ADMIN" ? "bg-red-500/20 text-red-400" :
                user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400" :
                "bg-zinc-800 text-zinc-400"
              }`}>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-white">{user.name || "Sin nombre"}</p>
                  {roleBadge(user.role)}
                  {!user.isActive && <Badge className="bg-red-500/20 text-red-400">Suspendido</Badge>}
                </div>
                <p className="text-sm text-zinc-400">{user.email}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Registrado: {new Date(user.createdAt).toLocaleString("es-CO")}
                  {user.lastLoginAt && ` · Último acceso: ${new Date(user.lastLoginAt).toLocaleString("es-CO")}`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {user.stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <p className="text-xs text-zinc-500">Ingresos totales</p>
              </div>
              <p className="mt-1 text-xl font-bold text-emerald-400">{formatCurrency(user.stats.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <p className="text-xs text-zinc-500">Gastos totales</p>
              </div>
              <p className="mt-1 text-xl font-bold text-red-400">{formatCurrency(user.stats.totalExpenses)}</p>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-indigo-400" />
                <p className="text-xs text-zinc-500">Balance</p>
              </div>
              <p className={`mt-1 text-xl font-bold ${user.stats.balance >= 0 ? "text-white" : "text-red-400"}`}>
                {formatCurrency(user.stats.balance)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Acciones */}
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={user.isActive ? "destructive" : "default"}
              onClick={() => handleUpdate({ isActive: !user.isActive })}
            >
              {user.isActive ? <UserX className="mr-1.5 h-4 w-4" /> : <UserCheck className="mr-1.5 h-4 w-4" />}
              {user.isActive ? "Suspender" : "Activar"}
            </Button>
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => handleUpdate({ role: user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "USER" : "ADMIN" })}>
              {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? <ShieldAlert className="mr-1.5 h-4 w-4" /> : <Shield className="mr-1.5 h-4 w-4" />}
              {user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "Quitar Admin" : "Hacer Admin"}
            </Button>
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setShowReset(!showReset)}>
              <Key className="mr-1.5 h-4 w-4" /> Restablecer Contraseña
            </Button>
          </div>

          {showReset && (
            <form onSubmit={handleResetPassword} className="mt-4 flex gap-2">
              <Input
                type="password"
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                className="max-w-xs border-zinc-800 bg-zinc-900 text-white"
                value={resetPass}
                onChange={e => setResetPass(e.target.value)}
                minLength={8}
                required
              />
              <Button type="submit" size="sm" disabled={resetPass.length < 8}>Guardar</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Notas de admin */}
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader><CardTitle>Notas de Administración</CardTitle></CardHeader>
        <CardContent>
          <textarea
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-white resize-y min-h-[80px]"
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            placeholder="Agregar notas sobre este usuario..."
          />
          <Button size="sm" className="mt-2" onClick={() => handleUpdate({ adminNotes })}>Guardar Notas</Button>
        </CardContent>
      </Card>

      {/* Transacciones recientes */}
      {user.recentTransactions?.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader><CardTitle>Últimas Transacciones</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-zinc-800/50 p-3">
                  <div>
                    <p className="text-sm text-white">{tx.description}</p>
                    <p className="text-xs text-zinc-500">{formatDate(tx.date)} · {tx.category?.name || "Sin categoría"}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datos crudos */}
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader><CardTitle>Información del Sistema</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div><span className="text-zinc-500">ID:</span> <span className="text-zinc-300 font-mono text-xs">{user.id}</span></div>
            <div><span className="text-zinc-500">Rol:</span> <span className="text-zinc-300">{user.role}</span></div>
            <div><span className="text-zinc-500">Estado:</span> <span className={user.isActive ? "text-emerald-400" : "text-red-400"}>{user.isActive ? "Activo" : "Suspendido"}</span></div>
            <div><span className="text-zinc-500">Creado:</span> <span className="text-zinc-300">{new Date(user.createdAt).toLocaleString("es-CO")}</span></div>
            {user.lastLoginAt && <div><span className="text-zinc-500">Último login:</span> <span className="text-zinc-300">{new Date(user.lastLoginAt).toLocaleString("es-CO")}</span></div>}
            <div><span className="text-zinc-500">Transacciones:</span> <span className="text-zinc-300">{user._count?.transactions || 0}</span></div>
            <div><span className="text-zinc-500">Presupuestos:</span> <span className="text-zinc-300">{user._count?.budgets || 0}</span></div>
            <div><span className="text-zinc-500">Metas:</span> <span className="text-zinc-300">{user._count?.goals || 0}</span></div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
