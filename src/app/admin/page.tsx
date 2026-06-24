"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, ArrowLeftRight, TrendingUp, Shield } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      </main>
    )
  }

  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/20 p-2"><Users className="h-5 w-5 text-indigo-400" /></div>
              <div>
                <p className="text-xs text-zinc-500">Usuarios</p>
                <p className="text-xl font-bold text-white">{stats?.totalUsers ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/20 p-2"><TrendingUp className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <p className="text-xs text-zinc-500">Activos este mes</p>
                <p className="text-xl font-bold text-white">{stats?.activeThisMonth ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2"><ArrowLeftRight className="h-5 w-5 text-amber-400" /></div>
              <div>
                <p className="text-xs text-zinc-500">Transacciones</p>
                <p className="text-xl font-bold text-white">{stats?.totalTransactions ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2"><Shield className="h-5 w-5 text-purple-400" /></div>
              <div>
                <p className="text-xs text-zinc-500">Admins</p>
                <p className="text-xl font-bold text-white">{stats?.adminCount ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.recentUsers && (
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader><CardTitle>Usuarios Recientes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{u.name || "Sin nombre"}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(u.createdAt).toLocaleDateString("es-CO")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
