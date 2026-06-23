import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardClientWrapper } from "@/components/dashboard/DashboardClientWrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return <DashboardClientWrapper>{children}</DashboardClientWrapper>
}
