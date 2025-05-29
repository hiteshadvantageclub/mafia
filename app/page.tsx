"use client"

import { useState } from "react"
import { GameProvider } from "@/contexts/game-context"
import { SocketProvider } from "@/contexts/socket-context"
import WelcomeScreen from "@/components/screens/welcome-screen"
import LobbyScreen from "@/components/screens/lobby-screen"
import CreateRoomScreen from "@/components/screens/create-room-screen"
import RoleAssignmentScreen from "@/components/screens/role-assignment-screen"
import NightPhaseScreen from "@/components/screens/night-phase-screen"
import DayPhaseScreen from "@/components/screens/day-phase-screen"
import VotingScreen from "@/components/screens/voting-screen"
import EliminationScreen from "@/components/screens/elimination-screen"
import GameOverScreen from "@/components/screens/game-over-screen"
import LoadingScreen from "@/components/screens/loading-screen"
import ErrorScreen from "@/components/screens/error-screen"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"

export type GameScreen =
  | "welcome"
  | "create-room"
  | "join-room"
  | "lobby"
  | "role-assignment"
  | "night"
  | "day"
  | "voting"
  | "elimination"
  | "game-over"
  | "loading"
  | "error"

export default function MafiaGame() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("welcome")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // WebSocket server URL - in production this would be your deployed server
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "wss://mafia-game-server.example.com"

  const handleError = (message: string) => {
    setError(message)
    setCurrentScreen("error")
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    })
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return <WelcomeScreen onScreenChange={setCurrentScreen} />
      case "create-room":
        return <CreateRoomScreen onScreenChange={setCurrentScreen} />
      case "lobby":
        return <LobbyScreen onScreenChange={setCurrentScreen} />
      case "role-assignment":
        return <RoleAssignmentScreen onScreenChange={setCurrentScreen} />
      case "night":
        return <NightPhaseScreen onScreenChange={setCurrentScreen} />
      case "day":
        return <DayPhaseScreen onScreenChange={setCurrentScreen} />
      case "voting":
        return <VotingScreen onScreenChange={setCurrentScreen} />
      case "elimination":
        return <EliminationScreen onScreenChange={setCurrentScreen} />
      case "game-over":
        return <GameOverScreen onScreenChange={setCurrentScreen} />
      case "loading":
        return <LoadingScreen />
      case "error":
        return <ErrorScreen error={error} onScreenChange={setCurrentScreen} />
      default:
        return <WelcomeScreen onScreenChange={setCurrentScreen} />
    }
  }

  return (
    <SocketProvider url={SOCKET_URL} onError={handleError}>
      <GameProvider onScreenChange={setCurrentScreen}>
        <div className="min-h-screen bg-slate-900 text-white">
          {renderCurrentScreen()}
          <Toaster />
        </div>
      </GameProvider>
    </SocketProvider>
  )
}
