"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import type { GameScreen } from "@/app/page"

interface ErrorScreenProps {
  error: string | null
  onScreenChange: (screen: GameScreen) => void
}

export default function ErrorScreen({ error, onScreenChange }: ErrorScreenProps) {
  const handleRetry = () => {
    onScreenChange("welcome")
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto" />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Connection Error</h2>
          <p className="text-slate-400">
            {error || "Unable to connect to the game server. Please check your internet connection and try again."}
          </p>
        </div>

        <Button onClick={handleRetry} className="w-full bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
