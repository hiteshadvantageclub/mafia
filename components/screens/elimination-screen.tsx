"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Skull, Shield, Search, Users } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface EliminationScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

const roleInfo = {
  mafia: {
    name: "Mafia",
    emoji: "🔪",
    icon: <Skull className="h-16 w-16 text-white" />,
    color: "from-red-500 to-red-700",
    textColor: "text-red-400",
  },
  villager: {
    name: "Villager",
    emoji: "👤",
    icon: <Users className="h-16 w-16 text-white" />,
    color: "from-blue-500 to-blue-700",
    textColor: "text-blue-400",
  },
  doctor: {
    name: "Doctor",
    emoji: "⚕️",
    icon: <Shield className="h-16 w-16 text-white" />,
    color: "from-green-500 to-green-700",
    textColor: "text-green-400",
  },
  detective: {
    name: "Detective",
    emoji: "🔍",
    icon: <Search className="h-16 w-16 text-white" />,
    color: "from-yellow-500 to-yellow-700",
    textColor: "text-yellow-400",
  },
}

export default function EliminationScreen({ onScreenChange }: EliminationScreenProps) {
  const { state } = useGame()
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Check if game is over
      const alivePlayers = state.players.filter((p) => p.isAlive)
      const aliveMafia = alivePlayers.filter((p) => p.role === "mafia")
      const aliveVillagers = alivePlayers.filter((p) => p.role !== "mafia")

      if (aliveMafia.length >= aliveVillagers.length || aliveMafia.length === 0) {
        onScreenChange("game-over")
      } else {
        onScreenChange("night")
      }
    }
  }, [countdown, state.players, onScreenChange])

  if (!state.eliminatedPlayer) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">No player was eliminated</p>
        </div>
      </div>
    )
  }

  const role = roleInfo[state.eliminatedPlayer.role || "villager"]

  // Calculate vote results
  const voteResults = Object.entries(
    Object.values(state.votes).reduce(
      (acc, vote) => {
        acc[vote] = (acc[vote] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).sort(([, a], [, b]) => b - a)

  const totalVotes = Object.keys(state.votes).length

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="w-8" />
        <h1 className="text-xl font-bold">Elimination Results</h1>
        <div className="w-8" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 text-center space-y-6">
        <div className="text-6xl mb-4">💀</div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{state.eliminatedPlayer.name} has been eliminated!</h2>
        </div>

        {/* Vote Results */}
        <div className="bg-slate-800 rounded-lg p-4 w-full max-w-md">
          <h3 className="text-white font-medium mb-3 text-center">Final Vote Count</h3>
          <div className="space-y-2">
            {voteResults.map(([playerId, votes]) => {
              const player = state.players.find((p) => p.id === playerId)
              if (!player) return null

              return (
                <div key={playerId} className="flex justify-between items-center">
                  <span className="text-slate-300">{player.name}</span>
                  <Badge className={player.id === state.eliminatedPlayer?.id ? "bg-red-600" : "bg-slate-600"}>
                    {votes}/{totalVotes} votes
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Role Reveal */}
        <div className="text-center space-y-4">
          <div className="bg-slate-800 rounded-lg p-4 w-full max-w-md">
            <p className="text-slate-400 text-sm mb-3">Their role was:</p>
            <div
              className={`w-24 h-24 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center mx-auto mb-3`}
            >
              {role.icon}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">{role.emoji}</span>
              <span className={`text-xl font-bold ${role.textColor}`}>{role.name}</span>
            </div>
          </div>

          {state.eliminatedPlayer.role === "mafia" ? (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 max-w-md">
              <p className="text-green-300 text-sm">🎉 Great job! You eliminated a mafia member!</p>
            </div>
          ) : (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 max-w-md">
              <p className="text-red-300 text-sm">😔 An innocent player was eliminated...</p>
            </div>
          )}
        </div>

        {/* Game Status */}
        <div className="bg-slate-800 rounded-lg p-4 w-full max-w-md">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Players remaining:</span>
            <span className="text-white">{state.players.filter((p) => p.isAlive).length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Mafia remaining:</span>
            <span className="text-red-400">{state.players.filter((p) => p.isAlive && p.role === "mafia").length}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center">
          <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
            <p className="text-purple-300 text-sm mb-2">Next phase starting in:</p>
            <div className="text-2xl font-bold text-purple-400">{countdown}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
