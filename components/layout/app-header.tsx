"use client"

import { Button } from "@/components/ui/button"
import { Menu, ArrowLeft } from "lucide-react"

interface AppHeaderProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
  showMenu?: boolean
  onMenuClick?: () => void
}

export function AppHeader({ title, showBackButton, onBack, showMenu = true, onMenuClick }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-3">
        {showBackButton ? (
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : showMenu ? (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="text-white hover:bg-slate-700">
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
      </div>
      <div className="w-10" />
    </header>
  )
}
