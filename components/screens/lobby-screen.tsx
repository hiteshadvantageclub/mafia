"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Crown, Copy, Check } from "lucide-react"
import { useState } from "react"
import { useGame } from "@/contexts/game-context"
import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/app-footer"
import type { GameScreen } from "@/app/page"

interface LobbyScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

export default function LobbyScreen({ onScreenChange }: LobbyScreenProps) {
  const { state, toggleReady, startGame, kickPlayer, leaveRoom } = useGame()
  const [copied, setCopied] = useState(false)

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(state.roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room code")
    }
  }

  const canStartGame = () => {
    const minPlayers = 4
    return state.players.length >= minPlayers && state.players.every((p) => p.isReady) && state.currentPlayer?.isHost
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="Lobby" showBackButton onBack={leaveRoom} />

      <main className="flex-1 p-6 pb-20 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Room Code</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="text-lg font-mono bg-slate-800 rounded-lg p-3 inline-block">{state.roomCode}</div>
            <Button variant="ghost" size="sm" onClick={copyRoomCode} className="text-slate-400 hover:text-white">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Players ({state.players.length}/{state.maxPlayers})
          </h3>

          <div className="space-y-3">
            {state.players.map((player) => (
              <div key={player.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">{player.avatar}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.isHost && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={player.isReady ? "default" : "secondary"}
                    className={player.isReady ? "bg-green-600" : "bg-slate-600"}
                  >
                    {player.isReady ? "Ready" : "Not Ready"}
                  </Badge>

                  {state.currentPlayer?.isHost && player.id !== state.currentPlayer.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => kickPlayer(player.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      Kick
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {state.currentPlayer?.isHost ? (
            <Button
              onClick={startGame}
              disabled={!canStartGame()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700 disabled:text-slate-400"
            >
              Start Game
            </Button>
          ) : (
            <Button
              onClick={toggleReady}
              className={`w-full ${
                state.currentPlayer?.isReady ? "bg-slate-600 hover:bg-slate-700" : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {state.currentPlayer?.isReady ? "Not Ready" : "Ready"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={leaveRoom}
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Leave Room
          </Button>
        </div>

        {state.currentPlayer?.isHost && !canStartGame() && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Game Requirements</h4>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-400">Minimum 4 players:</span>
                <span className={state.players.length >= 4 ? "text-green-400" : "text-red-400"}>
                  {state.players.length >= 4 ? "✓" : "✗"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">All players ready:</span>
                <span className={state.players.every((p) => p.isReady) ? "text-green-400" : "text-red-400"}>
                  {state.players.every((p) => p.isReady) ? "✓" : "✗"}
                </span>
              </li>
            </ul>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
