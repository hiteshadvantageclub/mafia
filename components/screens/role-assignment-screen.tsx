"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Skull, Shield, Search, Users, Clock } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface RoleAssignmentScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

const roleInfo = {
  mafia: {
    name: "Mafia",
    description: "Eliminate villagers during the night. Win when you equal the villagers.",
    icon: <Skull className="h-16 w-16 text-white" />,
    color: "from-red-500 to-red-700",
    textColor: "text-red-400",
  },
  villager: {
    name: "Villager",
    description: "Find and eliminate all mafia members. Vote during the day.",
    icon: <Users className="h-16 w-16 text-white" />,
    color: "from-blue-500 to-blue-700",
    textColor: "text-blue-400",
  },
  doctor: {
    name: "Doctor",
    description: "Protect one player each night from elimination.",
    icon: <Shield className="h-16 w-16 text-white" />,
    color: "from-green-500 to-green-700",
    textColor: "text-green-400",
  },
  detective: {
    name: "Detective",
    description: "Investigate one player each night to learn their role.",
    icon: <Search className="h-16 w-16 text-white" />,
    color: "from-yellow-500 to-yellow-700",
    textColor: "text-yellow-400",
  },
}

export default function RoleAssignmentScreen({ onScreenChange }: RoleAssignmentScreenProps) {
  const { state, dispatch } = useGame()
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (state.timer > 0 && confirmed) {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_TIMER", payload: state.timer - 1 })
      }, 1000)
      return () => clearTimeout(timer)
    } else if (state.timer === 0 && confirmed) {
      onScreenChange("night")
    }
  }, [state.timer, confirmed, dispatch, onScreenChange])

  const handleConfirm = () => {
    setConfirmed(true)
    dispatch({ type: "SET_TIMER", payload: 5 }) // 5 second countdown
  }

  // Get current player's role
  const role = state.currentPlayer?.role || "villager"
  const roleDetails = roleInfo[role]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="w-8" />
        <h1 className="text-xl font-bold">Role Assignment</h1>
        <div className="w-8" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-6 text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Role</h2>
          <p className="text-slate-400">{roleDetails.description}</p>
        </div>

        <div className="relative">
          <div
            className={`w-32 h-32 bg-gradient-to-br ${roleDetails.color} rounded-full flex items-center justify-center mb-4`}
          >
            {roleDetails.icon}
          </div>
          <div className="text-center">
            <h3 className={`text-xl font-bold ${roleDetails.textColor}`}>{roleDetails.name}</h3>
            <p className="text-sm text-slate-400 mt-2">{state.currentPlayer?.name}</p>
          </div>
        </div>

        {role === "mafia" && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 max-w-md">
            <p className="text-red-300 text-sm">
              <strong>Your team:</strong> You and other mafia members can communicate during the night phase.
            </p>
          </div>
        )}

        {confirmed ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span>Game starting in {state.timer}s</span>
          </div>
        ) : (
          <Button onClick={handleConfirm} className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white">
            I Understand My Role
          </Button>
        )}
      </div>
    </div>
  )
}
