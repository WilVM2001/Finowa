"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then(r => r.json())
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [])

  const actionBadge = (action: string) => {
    const map: Record<string, string> = {
      LOGIN: "bg-blue-500/20 text-blue-400",
      CREATE: "bg-emerald-500/20 text-emerald-400",
      UPDATE: "bg-amber-500/20 text-amber-400",
      DELETE: "bg-red-500/20 text-red-400",
    }
    return map[action] || "bg-zinc-500/20 text-zinc-400"
  }

  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-white">Registro de Auditoría</h1>

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Badge className={actionBadge(log.action)}>
                      {log.action}
                    </Badge>
                    <div>
                      <p className="text-sm text-white">{log.entity}</p>
                      <p className="text-xs text-zinc-500">
                        {log.user?.name || log.user?.email || "Sistema"} · {log.entityId?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600">
                    {new Date(log.createdAt).toLocaleString("es-CO")}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="py-8 text-center text-sm text-zinc-500">No hay registros de auditoría</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
