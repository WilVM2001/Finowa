"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50">
        {icon || <Package className="h-8 w-8 text-zinc-500" />}
      </div>
      <p className="text-sm font-medium text-white">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-zinc-500">{description}</p>}
      {action && (
        <Button size="sm" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
