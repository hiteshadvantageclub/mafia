"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, RotateCcw, Home, Skull, Shield, Search, Users } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface GameOverScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

const roleInfo = {
  mafia: { name: "Mafia", emoji: "🔪", icon: <Skull className="h-4 w-4" />, color: "text-red-400" },
  villager: { name: "Villager", emoji: "👤", icon: <Users className="h-4 w-4" />, color: "text-blue-400" },
  doctor: { name: "Doctor", emoji: "⚕️", icon: <Shield className="h-4 w-4" />, color: "text-green-400" },
  detective: { name: "Detective", emoji: "🔍", icon: <Search className="h-4 w-4" />, color: "text-yellow-400" },
}

export default function GameOverScreen({ onScreenChange }: GameOverScreenProps) {
  const { state, dispatch, leaveRoom } = useGame()
  const [showAllRoles, setShowAllRoles] = useState(false)

  const handlePlayAgain = () => {
    dispatch({ type: "RESET_GAME" })
    onScreenChange("lobby")
  }

  const handleNewGame = () => {
    leaveRoom()
    onScreenChange("welcome")
  }

  // Determine winners and losers
  const winners = state.players.filter((p) => {
    if (state.winner === "mafia") {
      return p.role === "mafia"
    } else {
      return p.role !== "mafia"
    }
  })

  const losers = state.players.filter((p) => {
    if (state.winner === "mafia") {
      return p.role !== "mafia"
    } else {
      return p.role === "mafia"
    }
  })

  const getWinMessage = () => {
    if (state.winner === "mafia") {
      return {
        title: "Mafia Wins!",
        description: "The mafia has successfully taken control of the town.",
        emoji: "🔪",
        color: "text-red-400",
      }
    } else {
      return {
        title: "Villagers Win!",
        description: "The villagers successfully identified and eliminated all members of the Mafia.",
        emoji: "🏆",
        color: "text-green-400",
      }
    }
  }

  const winInfo = getWinMessage()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="w-8" />
        <h1 className="text-xl font-bold">Game Over</h1>
        <div className="w-8" />
      </div>

      <div className="p-6 space-y-6">
        {/* Winner Announcement */}
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">{winInfo.emoji}</div>
          <h2 className={`text-3xl font-bold ${winInfo.color}`}>{winInfo.title}</h2>
          <p className="text-slate-300">{winInfo.description}</p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{state.dayCount}</div>
            <div className="text-sm text-slate-400">Days Played</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{state.nightCount}</div>
            <div className="text-sm text-slate-400">Nights Played</div>
          </div>
        </div>

        {/* Winners */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Winners
          </h3>
          <div className="space-y-2">
            {winners.map((player) => {
              const role = roleInfo[player.role || "villager"]
              return (
                <div key={player.id} className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-600 text-white">{player.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium">{player.name}</div>
                        <div className={`text-sm flex items-center gap-1 ${role.color}`}>
                          {role.icon}
                          {role.name}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Winner</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* All Players & Roles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">All Players</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllRoles(!showAllRoles)}
              className="border-slate-600 text-slate-400 hover:bg-slate-700"
            >
              {showAllRoles ? "Hide Roles" : "Show All Roles"}
            </Button>
          </div>

          <div className="space-y-2">
            {state.players.map((player) => {
              const role = roleInfo[player.role || "villager"]
              const isWinner = winners.some((w) => w.id === player.id)

              return (
                <div key={player.id} className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${isWinner ? "bg-green-600" : "bg-slate-600"} text-white`}>
                          {player.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-white font-medium flex items-center space-x-2">
                          <span>{player.name}</span>
                          {!player.isAlive && <Skull className="w-4 h-4 text-red-400" />}
                        </div>
                        {showAllRoles && (
                          <div className={`text-sm flex items-center gap-1 ${role.color}`}>
                            {role.icon}
                            {role.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isWinner && <Badge className="bg-green-600 text-xs">Winner</Badge>}
                      <Badge
                        variant={player.isAlive ? "default" : "secondary"}
                        className={player.isAlive ? "bg-blue-600" : "bg-slate-600"}
                      >
                        {player.isAlive ? "Alive" : "Eliminated"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handlePlayAgain} className="w-full bg-purple-600 hover:bg-purple-700">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again (Same Room)
          </Button>

          <Button
            onClick={handleNewGame}
            variant="outline"
            className="w-full border-slate-600 text-white hover:bg-slate-700"
          >
            <Home className="w-5 h-5 mr-2" />
            New Game
          </Button>
        </div>
      </div>
    </div>
  )
}
