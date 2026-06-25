"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import {
  Search, Shield, ShieldAlert, UserX, UserCheck, Eye, Key, Trash2,
} from "lucide-react"
import toast from "react-hot-toast"

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterNew, setFilterNew] = useState(false)
  const [resetModal, setResetModal] = useState<{ id: string; email: string } | null>(null)
  const [newPass, setNewPass] = useState("")

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) setUsers(await res.json())
    } catch { toast.error("Error al cargar usuarios") }
    setLoading(false)
  }

  async function toggleRole(userId: string, role: string) {
    const newRole = role === "SUPER_ADMIN" || role === "ADMIN" ? "USER" : "ADMIN"
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) { toast.success(`Rol cambiado a ${newRole}`); loadUsers() }
  }

  async function toggleActive(userId: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) { toast.success(isActive ? "Usuario suspendido" : "Usuario activado"); loadUsers() }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!resetModal || newPass.length < 8) { toast.error("Mínimo 8 caracteres"); return }
    const res = await fetch(`/api/admin/users/${resetModal.id}/reset-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: newPass }),
    })
    if (res.ok) { toast.success("Contraseña restablecida"); setResetModal(null); setNewPass("") }
    else { toast.error("Error al restablecer") }
  }

  const isNew = (createdAt: string) => {
    return new Date(createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchesNew = filterNew ? isNew(u.createdAt) : true
    return matchesSearch && matchesNew
  })

  const roleBadge = (role: string) => {
    if (role === "SUPER_ADMIN") return <Badge className="bg-red-500/20 text-red-400">Super Admin</Badge>
    if (role === "ADMIN") return <Badge className="bg-amber-500/20 text-amber-400">Admin</Badge>
    return <Badge className="bg-zinc-500/20 text-zinc-400">Usuario</Badge>
  }

  const newCount = users.filter(u => isNew(u.createdAt)).length

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-sm text-zinc-500">{users.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <Button
              size="sm"
              variant={filterNew ? "default" : "outline"}
              className={`h-8 text-xs ${filterNew ? "" : "border-zinc-700 text-zinc-400"}`}
              onClick={() => setFilterNew(!filterNew)}
            >
              Nuevos ({newCount})
            </Button>
          )}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="Buscar usuarios..."
              className="border-zinc-800 bg-zinc-900 pl-10 text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filtered.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-zinc-900/30">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      user.role === "SUPER_ADMIN" ? "bg-red-500/20 text-red-400" :
                      user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-white truncate">{user.name || "Sin nombre"}</p>
                        {!user.isActive && <Badge className="bg-red-500/20 text-red-400 text-[10px]">Suspendido</Badge>}
                        {isNew(user.createdAt) && <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Nuevo</Badge>}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {roleBadge(user.role)}
                        <span className="text-[10px] text-zinc-600">
                          {user._count?.transactions || 0} transacciones
                        </span>
                        <span className="text-[10px] text-zinc-600">·</span>
                        <span className="text-[10px] text-zinc-600">
                          {new Date(user.createdAt).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-indigo-400"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-400"
                      onClick={() => setResetModal({ id: user.id, email: user.email })}
                      title="Restablecer contraseña"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-amber-400"
                      onClick={() => toggleRole(user.id, user.role)}
                      title={user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                    >
                      {user.role === "SUPER_ADMIN" || user.role === "ADMIN"
                        ? <ShieldAlert className="h-4 w-4" />
                        : <Shield className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-red-400"
                      onClick={() => toggleActive(user.id, user.isActive)}
                      title={user.isActive ? "Suspender" : "Activar"}
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">No se encontraron usuarios</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal restablecer contraseña */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Restablecer Contraseña</h3>
            <p className="text-sm text-zinc-500 mb-4">{resetModal.email}</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <Input
                type="password"
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                className="border-zinc-800 bg-zinc-900 text-white"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                minLength={8}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={newPass.length < 8}>Guardar</Button>
                <Button type="button" variant="ghost" className="flex-1 text-zinc-400" onClick={() => { setResetModal(null); setNewPass("") }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
