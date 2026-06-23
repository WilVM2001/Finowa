"use client"

import { useSession } from "next-auth/react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { NotificationsDropdown } from "./NotificationsDropdown"
import { useEffect, useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-xl">
      <div>
        <h1 className="text-lg font-semibold text-white">
          Buenas {session?.user?.name?.split(" ")[0] || "Usuario"}
        </h1>
        <p className="text-sm text-zinc-500">Aquí está tu resumen financiero</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-zinc-400 hover:text-white"
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <NotificationsDropdown />
        <Avatar className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
      </div>
    </header>
  )
}
