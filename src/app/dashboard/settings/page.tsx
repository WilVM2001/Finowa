"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/dashboard/Header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { Avatar } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { Category } from "@/types"
import { Pencil, Trash2, Plus, X } from "lucide-react"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [importing, setImporting] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [newCat, setNewCat] = useState<{ name: string; icon: string; color: string; type: "INCOME" | "EXPENSE" }>({ name: "", icon: "circle", color: "#6366f1", type: "EXPENSE" })

  useEffect(() => {
    if (session?.user?.name) setProfileName(session.user.name)
    loadCategories()
  }, [session])

  async function loadCategories() {
    setCatLoading(true)
    try {
      const res = await fetch("/api/categories")
      if (res.ok) setCategories(await res.json())
    } catch { setCategories([]) }
    setCatLoading(false)
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName }),
      })
      if (res.ok) {
        await update({ name: profileName })
        toast.success("Perfil actualizado")
      } else { toast.error("Error al actualizar") }
    } catch { toast.error("Error de conexión") }
    setSavingProfile(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    try {
      const res = await fetch("/api/users/me/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast.success("Contraseña actualizada")
        setCurrentPassword("")
        setNewPassword("")
      } else {
        const err = await res.json()
        toast.error(err.error || "Error al cambiar contraseña")
      }
    } catch { toast.error("Error de conexión") }
    setSavingPassword(false)
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    setCatLoading(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      })
      if (res.ok) {
        toast.success("Categoría creada")
        setNewCat({ name: "", icon: "circle", color: "#6366f1", type: "EXPENSE" })
        loadCategories()
      } else { toast.error("Error al crear") }
    } catch { toast.error("Error") }
    setCatLoading(false)
  }

  async function handleUpdateCategory(cat: Category) {
    setCatLoading(true)
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cat.name, icon: cat.icon, color: cat.color }),
      })
      if (res.ok) { toast.success("Categoría actualizada"); loadCategories() }
      else { toast.error("Error al actualizar") }
    } catch { toast.error("Error") }
    setEditingCat(null)
    setCatLoading(false)
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return
    setCatLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (res.ok) { toast.success("Categoría eliminada"); loadCategories() }
      else {
        const err = await res.json()
        toast.error(err.error || "No se puede eliminar")
      }
    } catch { toast.error("Error") }
    setCatLoading(false)
  }

  async function handleCSVImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const text = await file.text()
    const Papa = await import("papaparse")
    Papa.parse(text, {
      header: true,
      complete: async (results: any) => {
        let success = 0
        for (const row of results.data) {
          if (!row.amount || !row.description) continue
          try {
            const res = await fetch("/api/transactions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: parseFloat(row.amount),
                type: row.type || "EXPENSE",
                description: row.description,
                categoryId: row.categoryId || "",
                date: row.date || new Date().toISOString(),
              }),
            })
            if (res.ok) success++
          } catch { /* skip row */ }
        }
        toast.success(`${success} transacciones importadas`)
        setImporting(false)
      },
    })
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf")
    await import("jspdf-autotable")

    const res = await fetch("/api/transactions")
    const json = await res.json()
    const transactions = json.data ?? []
    const summaryRes = await fetch("/api/summary")
    const summary = await summaryRes.json()

    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("Finanza - Reporte Financiero", 14, 22)
    doc.setFontSize(12)
    doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 14, 32)
    doc.setFontSize(16)
    doc.text("Resumen Mensual", 14, 48)
    doc.setFontSize(11)
    doc.text(`Ingresos: ${formatCurrency(summary.totalIncome)}`, 14, 58)
    doc.text(`Gastos: ${formatCurrency(summary.totalExpenses)}`, 14, 66)
    doc.text(`Balance: ${formatCurrency(summary.balance)}`, 14, 74)
    doc.setFontSize(16)
    doc.text("Transacciones Recientes", 14, 92)
    const rows = transactions.slice(0, 50).map((t: any) => [
      t.type === "INCOME" ? "Ingreso" : "Gasto",
      t.description,
      formatCurrency(t.amount),
      t.category?.name || "",
      new Date(t.date).toLocaleDateString("es-CO"),
    ])
    ;(doc as any).autoTable({
      startY: 98,
      head: [["Tipo", "Descripción", "Monto", "Categoría", "Fecha"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    })
    doc.save(`finanza-reporte-${new Date().toISOString().split("T")[0]}.pdf`)
    toast.success("PDF exportado")
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="space-y-6 p-6 max-w-3xl mx-auto">
        {/* Profile */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Información de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex-1">
                <p className="text-xs text-zinc-500">{session?.user?.email}</p>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <Label className="text-sm text-zinc-400">Nombre</Label>
              <Input
                className="border-zinc-800 bg-zinc-900 text-white"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Button type="submit" disabled={savingProfile || profileName === session?.user?.name}>
                {savingProfile ? "Guardando..." : "Actualizar Perfil"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <Label className="text-sm text-zinc-400">Contraseña actual</Label>
                <Input
                  type="password"
                  className="border-zinc-800 bg-zinc-900 text-white"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-sm text-zinc-400">Nueva contraseña</Label>
                <Input
                  type="password"
                  className="border-zinc-800 bg-zinc-900 text-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" disabled={savingPassword || !currentPassword || newPassword.length < 8}>
                {savingPassword ? "Guardando..." : "Cambiar Contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Category Management */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Gestión de Categorías</CardTitle>
            <CardDescription>Administra tus categorías de ingresos y gastos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <div>
                      <p className="text-sm font-medium text-white">{cat.name}</p>
                      <Badge variant={cat.type === "INCOME" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                        {cat.type === "INCOME" ? "Ingreso" : "Gasto"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingCat(cat)} className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="rounded p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingCat && (
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-indigo-400">Editar: {editingCat.name}</p>
                  <button onClick={() => setEditingCat(null)} className="text-zinc-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    className="border-zinc-800 bg-zinc-900 text-white text-sm"
                    value={editingCat.name}
                    onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  />
                  <Input
                    type="color"
                    className="h-9 w-12 cursor-pointer border-zinc-800 bg-zinc-900 p-1"
                    value={editingCat.color}
                    onChange={(e) => setEditingCat({ ...editingCat, color: e.target.value })}
                  />
                  <Button size="sm" onClick={() => handleUpdateCategory(editingCat)}>Guardar</Button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="mb-2 text-sm text-zinc-400">Nueva categoría</p>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Nombre"
                  className="flex-1 border-zinc-800 bg-zinc-900 text-white text-sm"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                />
                <Input
                  type="color"
                  className="h-9 w-12 cursor-pointer border-zinc-800 bg-zinc-900 p-1"
                  value={newCat.color}
                  onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                />
                <select
                  className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-sm text-white"
                  value={newCat.type}
                  onChange={(e) => setNewCat({ ...newCat, type: e.target.value as "INCOME" | "EXPENSE" })}
                >
                  <option value="EXPENSE">Gasto</option>
                  <option value="INCOME">Ingreso</option>
                </select>
                <Button size="sm" onClick={handleCreateCategory} disabled={!newCat.name || catLoading}>
                  <Plus className="mr-1 h-4 w-4" /> Crear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSV Import */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Importar CSV</CardTitle>
            <CardDescription>
              Importa transacciones desde un archivo CSV con columnas: amount, type, description, categoryId, date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 transition-colors hover:border-zinc-500">
                <div className="text-center">
                  <p className="text-sm text-zinc-400">
                    {importing ? "Importando..." : "Haz clic para seleccionar archivo CSV"}
                  </p>
                </div>
              </div>
              <Input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
            </Label>
          </CardContent>
        </Card>

        {/* PDF Export */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Exportar Reporte</CardTitle>
            <CardDescription>Descarga un reporte PDF de tus finanzas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportPDF}>Exportar PDF</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
