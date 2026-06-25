import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import { handleApiError } from "@/lib/api-utils"
import { createAuditLog } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "El email ya está registrado", code: "EMAIL_EXISTS" },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    })

    const defaultCategories = [
      // INGRESOS
      { name: "Salario", icon: "briefcase", color: "#22c55e", type: "INCOME" as const },
      { name: "Proyectos Web", icon: "laptop", color: "#3b82f6", type: "INCOME" as const },
      { name: "Otros Ingresos", icon: "plus-circle", color: "#a855f7", type: "INCOME" as const },
      // 50% NECESIDADES
      { name: "Vivienda", icon: "home", color: "#6366f1", type: "EXPENSE" as const },
      { name: "Servicios", icon: "zap", color: "#14b8a6", type: "EXPENSE" as const },
      { name: "Alimentación", icon: "utensils", color: "#ef4444", type: "EXPENSE" as const },
      { name: "Transporte", icon: "bus", color: "#f59e0b", type: "EXPENSE" as const },
      { name: "Salud", icon: "heart", color: "#22d3ee", type: "EXPENSE" as const },
      // 30% DESEOS
      { name: "Entretenimiento", icon: "gamepad-2", color: "#fb923c", type: "EXPENSE" as const },
      { name: "Suscripciones", icon: "repeat", color: "#f43f5e", type: "EXPENSE" as const },
      { name: "Compras", icon: "shopping-bag", color: "#ec4899", type: "EXPENSE" as const },
      { name: "Viajes", icon: "plane", color: "#06b6d4", type: "EXPENSE" as const },
      // 20% AHORRO E INVERSIÓN
      { name: "Ahorro", icon: "piggy-bank", color: "#10b981", type: "EXPENSE" as const },
      { name: "Inversiones", icon: "trending-up", color: "#8b5cf6", type: "EXPENSE" as const },
      { name: "Deudas", icon: "credit-card", color: "#ef4444", type: "EXPENSE" as const },
    ]

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({ ...cat, userId: user.id })),
    })

    await createAuditLog(user.id, "REGISTER", "User", user.id, { email: data.email, name: data.name })

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
