"use client"

import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
        <h2 className="text-xl font-semibold">Connecting...</h2>
        <p className="text-slate-400">Please wait while we connect you to the game server</p>
      </div>
    </div>
  )
}
