import { prisma } from "@/lib/prisma"
import { withAuth, success } from "@/lib/api-utils"

export const POST = withAuth(async (req, { userId }) => {
  const existingTxs = await prisma.transaction.count({ where: { userId } })
  if (existingTxs > 0) {
    return success({ error: "Ya tienes transacciones. Elimínalas primero si quieres reiniciar." }, 400)
  }

  const categories = await prisma.category.findMany({ where: { userId } })
  const catMap = new Map(categories.map((c) => [c.name, c]))

  const now = new Date()
  const seedData: Array<{
    amount: number
    type: "INCOME" | "EXPENSE"
    description: string
    date: Date
    categoryId: string
  }> = []

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

    const salaryCat = catMap.get("Salario")
    if (salaryCat) {
      seedData.push({
        amount: 25000 + Math.random() * 5000,
        type: "INCOME",
        description: "Salario mensual",
        date: new Date(d.getFullYear(), d.getMonth(), Math.min(5, daysInMonth)),
        categoryId: salaryCat.id,
      })
    }

    const freelanceCat = catMap.get("Freelance")
    if (freelanceCat) {
      seedData.push({
        amount: 3000 + Math.random() * 7000,
        type: "INCOME",
        description: "Proyecto freelance",
        date: new Date(d.getFullYear(), d.getMonth(), Math.min(15, daysInMonth)),
        categoryId: freelanceCat.id,
      })
    }

    const foodCat = catMap.get("Alimentación")
    if (foodCat) {
      for (let i = 0; i < 8; i++) {
        seedData.push({
          amount: 150 + Math.random() * 400,
          type: "EXPENSE" as const,
          description: ["Supermercado", "Restaurante", "Comida rápida", "Cafetería"][Math.floor(Math.random() * 4)],
          date: new Date(d.getFullYear(), d.getMonth(), Math.floor(Math.random() * daysInMonth) + 1),
          categoryId: foodCat.id,
        })
      }
    }

    const transportCat = catMap.get("Transporte")
    if (transportCat) {
      for (let i = 0; i < 4; i++) {
        seedData.push({
          amount: 50 + Math.random() * 200,
          type: "EXPENSE" as const,
          description: ["Gasolina", "Uber", "Metro", "Estacionamiento"][Math.floor(Math.random() * 4)],
          date: new Date(d.getFullYear(), d.getMonth(), Math.floor(Math.random() * daysInMonth) + 1),
          categoryId: transportCat.id,
        })
      }
    }

    const housingCat = catMap.get("Vivienda")
    if (housingCat) {
      seedData.push({
        amount: 8000 + Math.random() * 2000,
        type: "EXPENSE" as const,
        description: "Renta",
        date: new Date(d.getFullYear(), d.getMonth(), Math.min(5, daysInMonth)),
        categoryId: housingCat.id,
      })
    }

    const servicesCat = catMap.get("Servicios")
    if (servicesCat) {
      seedData.push({
        amount: 500 + Math.random() * 1000,
        type: "EXPENSE" as const,
        description: "Servicios (agua, luz, internet)",
        date: new Date(d.getFullYear(), d.getMonth(), Math.min(10, daysInMonth)),
        categoryId: servicesCat.id,
      })
    }

    const subsCat = catMap.get("Suscripciones")
    if (subsCat) {
      seedData.push(
        {
          amount: 139,
          type: "EXPENSE" as const,
          description: "Netflix",
          date: new Date(d.getFullYear(), d.getMonth(), Math.min(15, daysInMonth)),
          categoryId: subsCat.id,
        },
        {
          amount: 99,
          type: "EXPENSE" as const,
          description: "Spotify",
          date: new Date(d.getFullYear(), d.getMonth(), Math.min(20, daysInMonth)),
          categoryId: subsCat.id,
        }
      )
    }

    const entertainmentCat = catMap.get("Entretenimiento")
    if (entertainmentCat) {
      for (let i = 0; i < 3; i++) {
        seedData.push({
          amount: 100 + Math.random() * 500,
          type: "EXPENSE" as const,
          description: ["Cine", "Restaurante", "Concierto", "Videojuego"][Math.floor(Math.random() * 4)],
          date: new Date(d.getFullYear(), d.getMonth(), Math.floor(Math.random() * daysInMonth) + 1),
          categoryId: entertainmentCat.id,
        })
      }
    }

    const healthCat = catMap.get("Salud")
    if (healthCat) {
      seedData.push({
        amount: 500 + Math.random() * 500,
        type: "EXPENSE" as const,
        description: "Consulta médica / Medicinas",
        date: new Date(d.getFullYear(), d.getMonth(), Math.floor(Math.random() * daysInMonth) + 1),
        categoryId: healthCat.id,
      })
    }

    const educationCat = catMap.get("Educación")
    if (educationCat && monthOffset % 2 === 0) {
      seedData.push({
        amount: 1000 + Math.random() * 2000,
        type: "EXPENSE" as const,
        description: "Curso / Certificación",
        date: new Date(d.getFullYear(), d.getMonth(), Math.floor(Math.random() * daysInMonth) + 1),
        categoryId: educationCat.id,
      })
    }
  }

  const seedDataWithUser = seedData.map((tx) => ({ ...tx, userId }))
  await prisma.transaction.createMany({ data: seedDataWithUser })

  const budgets = [
    { categoryId: catMap.get("Alimentación")?.id, amount: 4000, percentage: 15 },
    { categoryId: catMap.get("Transporte")?.id, amount: 2000, percentage: 7.5 },
    { categoryId: catMap.get("Vivienda")?.id, amount: 10000, percentage: 30 },
    { categoryId: catMap.get("Entretenimiento")?.id, amount: 2000, percentage: 7.5 },
    { categoryId: catMap.get("Salud")?.id, amount: 1500, percentage: 5 },
    { categoryId: catMap.get("Suscripciones")?.id, amount: 500, percentage: 2 },
  ]

  const nowDate = new Date()
  for (const b of budgets) {
    if (b.categoryId) {
      const spentAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: "EXPENSE",
          date: {
            gte: new Date(nowDate.getFullYear(), nowDate.getMonth(), 1),
            lt: new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1),
          },
        },
        _sum: { amount: true },
      })

      await prisma.budget.upsert({
        where: {
          categoryId_userId_month_year: {
            categoryId: b.categoryId,
            userId,
            month: nowDate.getMonth() + 1,
            year: nowDate.getFullYear(),
          },
        },
        update: { amount: b.amount, percentage: b.percentage, spent: spentAgg._sum.amount || 0 },
        create: {
          categoryId: b.categoryId,
          userId,
          amount: b.amount,
          percentage: b.percentage,
          spent: spentAgg._sum.amount || 0,
          month: nowDate.getMonth() + 1,
          year: nowDate.getFullYear(),
        },
      })
    }
  }

  await prisma.goal.createMany({
    data: [
      {
        name: "Fondo de Emergencia",
        targetAmount: 100000,
        currentAmount: 35000,
        monthlyContribution: 5000,
        color: "#22c55e",
        icon: "shield",
        userId,
      },
      {
        name: "Viaje a Europa",
        targetAmount: 150000,
        currentAmount: 45000,
        monthlyContribution: 8000,
        color: "#6366f1",
        icon: "plane",
        userId,
      },
      {
        name: "Nuevo Laptop",
        targetAmount: 35000,
        currentAmount: 12000,
        monthlyContribution: 4000,
        color: "#a855f7",
        icon: "laptop",
        userId,
      },
    ],
  })

  return success({
    message: "Datos de demostración creados exitosamente",
    transactions: seedData.length,
    budgets: budgets.length,
    goals: 3,
  })
})
