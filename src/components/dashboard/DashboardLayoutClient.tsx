"use client"

import { createContext, useContext, useState } from "react"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
})

export function useSidebar() {
  return useContext(SidebarContext)
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}
