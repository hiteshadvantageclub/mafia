"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Moon, Shield, Search, Skull, Clock, MessageCircle, Send } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface NightPhaseScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

export default function NightPhaseScreen({ onScreenChange }: NightPhaseScreenProps) {
  const { state, dispatch, submitNightAction, sendChatMessage } = useGame()
  const [selectedTarget, setSelectedTarget] = useState<string>("")
  const [actionSubmitted, setActionSubmitted] = useState(false)
  const [newMessage, setNewMessage] = useState("")

  // Filter messages for Mafia chat
  const mafiaMessages = state.chatMessages.filter((msg) => msg.isMafiaChat)

  // Check if current player is mafia
  const isMafia = state.currentPlayer?.role === "mafia"

  // Get role-specific action text
  const getActionText = () => {
    if (!state.currentPlayer?.role) return "Wait for the night to end"

    switch (state.currentPlayer.role) {
      case "mafia":
        return "Choose a player to eliminate"
      case "doctor":
        return "Choose a player to protect"
      case "detective":
        return "Choose a player to investigate"
      default:
        return "Wait for the night to end"
    }
  }

  // Get role-specific icon
  const getActionIcon = () => {
    if (!state.currentPlayer?.role) return <Moon className="h-5 w-5" />

    switch (state.currentPlayer.role) {
      case "mafia":
        return <Skull className="h-5 w-5" />
      case "doctor":
        return <Shield className="h-5 w-5" />
      case "detective":
        return <Search className="h-5 w-5" />
      default:
        return <Moon className="h-5 w-5" />
    }
  }

  // Check if player can take action
  const canTakeAction = () => {
    return state.currentPlayer?.isAlive && ["mafia", "doctor", "detective"].includes(state.currentPlayer?.role || "")
  }

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle submit action
  const handleSubmitAction = () => {
    if (selectedTarget) {
      submitNightAction(selectedTarget)
      setActionSubmitted(true)
    }
  }

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendChatMessage(newMessage)
      setNewMessage("")
    }
  }

  // Timer effect
  useEffect(() => {
    if (state.timer === 0) {
      onScreenChange("day")
    }
  }, [state.timer, onScreenChange])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Moon className="h-5 w-5 text-blue-400" />
          <h1 className="text-xl font-bold">Night Phase</h1>
        </div>
        <Badge className="bg-blue-600 text-white">
          <Clock className="h-4 w-4 mr-1" />
          {formatTime(state.timer)}
        </Badge>
      </div>

      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <div className="text-center">
          <p className="text-slate-300">Night {state.nightCount} - The town sleeps...</p>
        </div>
      </div>

      {/* Role Action */}
      {canTakeAction() && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            {getActionIcon()}
            <span className="text-white font-medium">{getActionText()}</span>
          </div>

          {!actionSubmitted ? (
            <div className="space-y-3">
              <RadioGroup value={selectedTarget} onValueChange={setSelectedTarget}>
                {state.players
                  .filter((p) => p.id !== state.currentPlayer?.id && p.isAlive)
                  .map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                      <RadioGroupItem value={player.id} id={player.id} />
                      <Label htmlFor={player.id} className="flex items-center gap-3 flex-1 cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-600 text-white text-sm">{player.avatar}</AvatarFallback>
                        </Avatar>
                        <span>{player.name}</span>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>

              <Button
                onClick={handleSubmitAction}
                disabled={!selectedTarget}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Confirm Action
              </Button>
            </div>
          ) : (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <p className="text-green-300 text-center">✓ Action submitted. Waiting for other players...</p>
            </div>
          )}
        </div>
      )}

      {/* Mafia Chat */}
      {isMafia && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <MessageCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400 font-medium">Mafia Chat</span>
          </div>

          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <div className="h-48 overflow-y-auto p-3 space-y-3">
              {mafiaMessages.length === 0 ? (
                <p className="text-slate-500 text-center text-sm">No messages yet</p>
              ) : (
                mafiaMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-2">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-red-600 text-white text-xs">{msg.playerName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-400">{msg.playerName}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-slate-700">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="p-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Moon className="h-5 w-5 text-blue-400" />
            Night Status
          </h3>

          <div className="space-y-3">
            <div className="text-sm text-slate-300">
              {!canTakeAction() ? (
                <p>You have no actions during the night. Wait for dawn...</p>
              ) : actionSubmitted ? (
                <p>Your action has been submitted. Waiting for other players to complete their actions.</p>
              ) : (
                <p>Choose your target carefully. You cannot change your decision once submitted.</p>
              )}
            </div>

            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Players alive:</span>
                <span className="text-white">{state.players.filter((p) => p.isAlive).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
