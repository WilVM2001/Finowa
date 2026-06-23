"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface Props {
  monthlyTrend: { month: string; income: number; expenses: number }[]
  categoryBreakdown: { name: string; amount: number; color: string }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

export function AnalyticsCharts({ monthlyTrend, categoryBreakdown }: Props) {
  return (
    <Tabs defaultValue="trend" className="space-y-4">
      <TabsList className="border-zinc-800 bg-zinc-900">
        <TabsTrigger value="trend">Tendencia Mensual</TabsTrigger>
        <TabsTrigger value="breakdown">Distribución de Gastos</TabsTrigger>
      </TabsList>

      <TabsContent value="trend">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Flujo de Dinero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <XAxis
                    dataKey="month"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="breakdown">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Desglose por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryBreakdown.length === 0 && (
                  <p className="py-8 text-center text-sm text-zinc-500">
                    No hay gastos este mes
                  </p>
                )}
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm text-zinc-300">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
