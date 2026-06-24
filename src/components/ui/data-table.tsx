"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  loading?: boolean
  emptyState?: React.ReactNode
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (key: string) => void
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  emptyState,
  sortBy,
  sortOrder = "desc",
  onSort,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider ${
                  col.sortable && onSort ? "cursor-pointer select-none hover:text-white" : ""
                } ${col.className || ""}`}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && onSort && (
                    sortBy === col.key
                      ? sortOrder === "asc"
                        ? <ChevronUp className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />
                      : <ChevronsUpDown className="h-3 w-3 text-zinc-700" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          <AnimatePresence>
            {data.map((item) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="transition-colors hover:bg-zinc-900/30"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-zinc-300 ${col.className || ""}`}>
                    {col.render ? col.render(item) : String(item[col.key] ?? "")}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      {data.length === 0 && emptyState}
    </div>
  )
}
