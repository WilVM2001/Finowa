"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = "Error",
  message,
  onRetry,
  retryLabel = "Reintentar",
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <p className="text-sm font-medium text-red-400">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-zinc-500">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-4 border-zinc-700 text-zinc-300 hover:text-white" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          {retryLabel}
        </Button>
      )}
    </motion.div>
  )
}
