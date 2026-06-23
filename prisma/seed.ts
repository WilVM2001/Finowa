import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"
import { hash } from "bcryptjs"

const libsql = createClient({ url: "file:./prisma/dev.db" })
const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Inicializando Finanza...")

  const password = await hash("Wdev2024!", 12)

  const user = await prisma.user.upsert({
    where: { email: "admin@wdev.com" },
    update: {},
    create: { name: "WDEV Admin", email: "admin@wdev.com", password },
  })

  console.log("✅ Usuario: admin@wdev.com / Wdev2024!")

  const existingCategories = await prisma.category.count({ where: { userId: user.id } })
  if (existingCategories === 0) {
    const defaultCategories = [
      { name: "Salario", icon: "briefcase", color: "#22c55e", type: "INCOME" as const },
      { name: "Proyectos Web", icon: "laptop", color: "#3b82f6", type: "INCOME" as const },
      { name: "Otros Ingresos", icon: "plus-circle", color: "#a855f7", type: "INCOME" as const },
      { name: "Vivienda", icon: "home", color: "#6366f1", type: "EXPENSE" as const },
      { name: "Servicios", icon: "zap", color: "#14b8a6", type: "EXPENSE" as const },
      { name: "Alimentación", icon: "utensils", color: "#ef4444", type: "EXPENSE" as const },
      { name: "Transporte", icon: "bus", color: "#f59e0b", type: "EXPENSE" as const },
      { name: "Salud", icon: "heart", color: "#22d3ee", type: "EXPENSE" as const },
      { name: "Entretenimiento", icon: "gamepad-2", color: "#fb923c", type: "EXPENSE" as const },
      { name: "Suscripciones", icon: "repeat", color: "#f43f5e", type: "EXPENSE" as const },
      { name: "Compras", icon: "shopping-bag", color: "#ec4899", type: "EXPENSE" as const },
      { name: "Viajes", icon: "plane", color: "#06b6d4", type: "EXPENSE" as const },
      { name: "Ahorro", icon: "piggy-bank", color: "#10b981", type: "EXPENSE" as const },
      { name: "Inversiones", icon: "trending-up", color: "#8b5cf6", type: "EXPENSE" as const },
      { name: "Deudas", icon: "credit-card", color: "#ef4444", type: "EXPENSE" as const },
    ]

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({ ...cat, userId: user.id })),
    })
    console.log("✅ 15 categorías 50/30/20 creadas")
  } else {
    console.log("✅ Categorías ya existentes")
  }

  console.log("🚀 Listo! Sin movimientos predefinidos — tú agregas los tuyos.")
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
