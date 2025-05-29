"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface CreateRoomScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

export default function CreateRoomScreen({ onScreenChange }: CreateRoomScreenProps) {
  const [playerName, setPlayerName] = useState("")
  const [roomName, setRoomName] = useState("")
  const [roomPassword, setRoomPassword] = useState("")
  const [maxPlayers, setMaxPlayers] = useState("8")
  const [roleSet, setRoleSet] = useState("classic")
  const { createRoom } = useGame()

  const handleCreateRoom = () => {
    if (!playerName.trim() || !roomName.trim()) return
    createRoom(roomName, playerName, roomPassword || undefined, Number.parseInt(maxPlayers))
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onScreenChange("welcome")}
          className="text-white hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Create Room</h1>
        <div className="w-8" />
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="player-name" className="text-sm font-medium text-slate-300">
              Name
            </Label>
            <Input
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              maxLength={20}
            />
          </div>

          <div>
            <Label htmlFor="room-name" className="text-sm font-medium text-slate-300">
              Room Name
            </Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              maxLength={30}
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-slate-300">
              Password (Optional)
            </Label>
            <Input
              id="password"
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              maxLength={20}
            />
          </div>

          <div>
            <Label htmlFor="max-players" className="text-sm font-medium text-slate-300">
              Max Players
            </Label>
            <Select value={maxPlayers} onValueChange={setMaxPlayers}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="4">4 Players</SelectItem>
                <SelectItem value="6">6 Players</SelectItem>
                <SelectItem value="8">8 Players</SelectItem>
                <SelectItem value="10">10 Players</SelectItem>
                <SelectItem value="12">12 Players</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role-set" className="text-sm font-medium text-slate-300">
              Role Set
            </Label>
            <Select value={roleSet} onValueChange={setRoleSet}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="classic">Classic (Mafia, Villager, Doctor, Detective)</SelectItem>
                <SelectItem value="simple">Simple (Mafia, Villager)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleCreateRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!playerName.trim() || !roomName.trim()}
        >
          Create Room
        </Button>
      </div>
    </div>
  )
}
