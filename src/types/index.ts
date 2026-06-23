export type TransactionType = "INCOME" | "EXPENSE"

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType
  userId: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  description: string
  date: Date
  categoryId: string
  userId: string
  category: Category
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  amount: number
  percentage: number
  spent: number
  month: number
  year: number
  categoryId: string
  userId: string
  category: Category
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  deadline: Date | null
  icon: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  savingsRate: number
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  monthlyTrend: { month: string; income: number; expenses: number }[]
  categoryBreakdown: { name: string; amount: number; color: string }[]
}
