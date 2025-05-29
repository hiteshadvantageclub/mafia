"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGame } from "@/contexts/game-context"
import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/app-footer"
import type { GameScreen } from "@/app/page"

interface WelcomeScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

export default function WelcomeScreen({ onScreenChange }: WelcomeScreenProps) {
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const { joinRoom } = useGame()

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return
    joinRoom(roomCode.toUpperCase(), playerName)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Mafia Game" />

      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Join a Room</h2>
            <p className="text-slate-400">Enter your name and room code to join the game</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-slate-300">
                Name
              </Label>
              <Input
                id="name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="code" className="text-sm font-medium text-slate-300">
                Room Code
              </Label>
              <Input
                id="code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <Button
            onClick={handleJoinRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!playerName.trim() || !roomCode.trim()}
          >
            Join Room
          </Button>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => onScreenChange("create-room")}
              className="text-blue-400 hover:text-blue-300"
            >
              Create a new room instead
            </Button>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
