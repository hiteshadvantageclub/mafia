"use client"

import { Button } from "@/components/ui/button"
import { Home, Users, MessageCircle, Settings } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2">
      <div className="flex justify-around">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white">
          <Home className="h-4 w-4" />
          <span className="text-xs">Home</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white">
          <Users className="h-4 w-4" />
          <span className="text-xs">Players</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white">
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">Chat</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white">
          <Settings className="h-4 w-4" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </footer>
  )
}
