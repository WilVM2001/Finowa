import { z } from "zod"

export const transactionSchema = z.object({
  amount: z.number().positive("El monto debe ser positivo"),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "Descripción requerida").max(200, "Máximo 200 caracteres"),
  date: z.string().optional(),
  categoryId: z.string().min(1, "Categoría requerida"),
})

export const transactionUpdateSchema = z.object({
  id: z.string(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  description: z.string().min(1, "Descripción requerida").max(200, "Máximo 200 caracteres").optional(),
  date: z.string().optional(),
  categoryId: z.string().min(1, "Categoría requerida").optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(50, "Máximo 50 caracteres"),
  icon: z.string().optional().default("circle"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido (formato: #RRGGBB)")
    .optional()
    .default("#6366f1"),
  type: z.enum(["INCOME", "EXPENSE"]),
})

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Categoría requerida"),
  amount: z.number().positive("El monto debe ser positivo"),
  percentage: z.number().min(0).max(100, "Porcentaje entre 0 y 100").optional().default(0),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
})

export const budgetUpdateSchema = z.object({
  id: z.string(),
  amount: z.number().positive("El monto debe ser positivo").optional(),
  percentage: z.number().min(0).max(100, "Porcentaje entre 0 y 100").optional(),
})

export const goalSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100, "Máximo 100 caracteres"),
  targetAmount: z.number().positive("El monto objetivo debe ser positivo"),
  currentAmount: z.number().min(0).optional().default(0),
  monthlyContribution: z.number().min(0).optional().default(0),
  deadline: z.string().optional().nullable(),
  icon: z.string().optional().default("target"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido").optional().default("#6366f1"),
})

export const goalUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  deadline: z.string().optional().nullable(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres").max(100),
})

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
})
