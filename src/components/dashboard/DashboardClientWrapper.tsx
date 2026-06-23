"use client"

import { Sidebar } from "@/components/dashboard/Sidebar"
import { DashboardLayoutClient, useSidebar } from "@/components/dashboard/DashboardLayoutClient"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        {children}
      </div>
    </div>
  )
}

export function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient>
      <DashboardContent>{children}</DashboardContent>
    </DashboardLayoutClient>
  )
}
