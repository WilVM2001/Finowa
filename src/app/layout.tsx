import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/providers/Providers"

export const metadata: Metadata = {
  title: "Finanza - Gestión Financiera Inteligente",
  description:
    "Plataforma financiera personal con IA para optimizar tus ahorros, presupuestos y metas financieras.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-black font-sans text-zinc-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
