"use client"

import { useRef } from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sun, MessageCircle, Users, Clock, Send } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface DayPhaseScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

export default function DayPhaseScreen({ onScreenChange }: DayPhaseScreenProps) {
  const { state, sendChatMessage, dispatch } = useGame()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter messages for day chat (non-mafia)
  const dayMessages = state.chatMessages.filter((msg) => !msg.isMafiaChat)

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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
      onScreenChange("voting")
    }
  }, [state.timer, onScreenChange])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.chatMessages])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Sun className="h-5 w-5 text-yellow-400" />
          <h1 className="text-xl font-bold">Day Discussion</h1>
        </div>
        <Badge className="bg-yellow-600 text-white">
          <Clock className="h-4 w-4 mr-1" />
          {formatTime(state.timer)}
        </Badge>
      </div>

      <div className="p-4 bg-yellow-900/20 border-b border-yellow-700/50">
        <div className="text-center">
          <p className="text-yellow-300">Day {state.dayCount} - Time to discuss</p>
          {state.eliminatedPlayer ? (
            <p className="text-slate-400 text-sm mt-1">
              Last night, {state.eliminatedPlayer.name} was eliminated. They were a {state.eliminatedPlayer.role}.
            </p>
          ) : (
            <p className="text-slate-400 text-sm mt-1">Last night, no one was eliminated.</p>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-5 w-5 text-white" />
          <span className="text-white font-medium">
            Players Alive ({state.players.filter((p) => p.isAlive).length})
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.players
            .filter((p) => p.isAlive)
            .map((player) => (
              <Badge key={player.id} variant="outline" className="border-slate-600 text-slate-300">
                {player.name}
              </Badge>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Town Discussion</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {dayMessages.length === 0 ? (
            <p className="text-slate-500 text-center">No messages yet. Start the discussion!</p>
          ) : (
            dayMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-600 text-white text-sm">{msg.playerName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.playerName}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={!state.currentPlayer?.isAlive}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newMessage.trim() || !state.currentPlayer?.isAlive}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
