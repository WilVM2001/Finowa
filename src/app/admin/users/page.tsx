"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Shield, ShieldAlert, UserX, UserCheck, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

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
    const newRole = role === "SUPER_ADMIN" ? "USER" : "ADMIN"
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) { toast.success(`Rol actualizado a ${newRole}`); loadUsers() }
  }

  async function toggleActive(userId: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    if (res.ok) { toast.success(isActive ? "Usuario suspendido" : "Usuario activado"); loadUsers() }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const roleBadge = (role: string) => {
    if (role === "SUPER_ADMIN") return <Badge className="bg-red-500/20 text-red-400">Super Admin</Badge>
    if (role === "ADMIN") return <Badge className="bg-amber-500/20 text-amber-400">Admin</Badge>
    return <Badge className="bg-zinc-500/20 text-zinc-400">Usuario</Badge>
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
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

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filtered.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                      user.role === "SUPER_ADMIN" ? "bg-red-500/20 text-red-400" :
                      user.role === "ADMIN" ? "bg-amber-500/20 text-amber-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{user.name || "Sin nombre"}</p>
                        {!user.isActive && <Badge className="bg-red-500/20 text-red-400 text-[10px]">Suspendido</Badge>}
                      </div>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {roleBadge(user.role)}
                        <span className="text-[10px] text-zinc-600">
                          {user._count?.transactions || 0} tx · {new Date(user.createdAt).toLocaleDateString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-zinc-400 hover:text-amber-400"
                      onClick={() => toggleRole(user.id, user.role)}
                      title={user.role === "SUPER_ADMIN" ? "Quitar admin" : "Hacer admin"}
                    >
                      {user.role === "SUPER_ADMIN" ? <ShieldAlert className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-zinc-400 hover:text-red-400"
                      onClick={() => toggleActive(user.id, user.isActive)}
                      title={user.isActive ? "Suspender" : "Activar"}
                    >
                      {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
