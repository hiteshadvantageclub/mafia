"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Vote, Clock } from "lucide-react"
import { useGame } from "@/contexts/game-context"
import type { GameScreen } from "@/app/page"

interface VotingScreenProps {
  onScreenChange: (screen: GameScreen) => void
}

export default function VotingScreen({ onScreenChange }: VotingScreenProps) {
  const { state, submitVote } = useGame()
  const [selectedVote, setSelectedVote] = useState<string>("")
  const [voteSubmitted, setVoteSubmitted] = useState(false)

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle vote submission
  const handleSubmitVote = () => {
    if (selectedVote) {
      submitVote(selectedVote)
      setVoteSubmitted(true)
    }
  }

  // Handle skip vote
  const handleSkipVote = () => {
    setVoteSubmitted(true)
  }

  // Timer effect
  useEffect(() => {
    if (state.timer === 0) {
      onScreenChange("elimination")
    }
  }, [state.timer, onScreenChange])

  // Get vote counts
  const getVoteCount = (playerId: string) => {
    return Object.values(state.votes).filter((vote) => vote === playerId).length
  }

  const getTotalVotes = () => {
    return Object.keys(state.votes).length
  }

  const alivePlayers = state.players.filter((p) => p.isAlive)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Vote className="h-5 w-5 text-red-400" />
          <h1 className="text-xl font-bold">Voting Phase</h1>
        </div>
        <Badge className="bg-red-600 text-white">
          <Clock className="h-4 w-4 mr-1" />
          {formatTime(state.timer)}
        </Badge>
      </div>

      <div className="p-4 bg-red-900/20 border-b border-red-700">
        <div className="text-center space-y-2">
          <p className="text-red-300 font-medium">Vote to eliminate a player</p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(state.timer / 60)}</div>
              <div className="text-slate-400">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{state.timer % 60}</div>
              <div className="text-slate-400">Seconds</div>
            </div>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-400">
            Votes cast: {getTotalVotes()}/{alivePlayers.length}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!voteSubmitted ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Choose a player to eliminate:</h2>

            <RadioGroup value={selectedVote} onValueChange={setSelectedVote}>
              <div className="space-y-3">
                {alivePlayers
                  .filter((p) => p.id !== state.currentPlayer?.id)
                  .map((player) => (
                    <div key={player.id} className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
                      <RadioGroupItem value={player.id} id={`vote-${player.id}`} />
                      <Label htmlFor={`vote-${player.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-600 text-white">{player.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <span className="font-medium">{player.name}</span>
                        </div>
                      </Label>
                      {getVoteCount(player.id) > 0 && (
                        <Badge className="bg-red-600">
                          {getVoteCount(player.id)} vote{getVoteCount(player.id) !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </RadioGroup>

            <div className="space-y-3">
              <Button
                onClick={handleSubmitVote}
                disabled={!selectedVote}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {selectedVote
                  ? `Vote for ${alivePlayers.find((p) => p.id === selectedVote)?.name}`
                  : "Select a player to vote"}
              </Button>

              <Button
                onClick={handleSkipVote}
                variant="outline"
                className="w-full border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                Skip Vote (Abstain)
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg p-6 text-center space-y-4">
            <div className="text-green-400 text-lg font-medium">✓ Vote Submitted</div>
            <p className="text-slate-300">Waiting for other players to vote...</p>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Current Votes:</h3>
              <div className="space-y-2">
                {alivePlayers.map((player) => {
                  const voteCount = getVoteCount(player.id)
                  if (voteCount === 0) return null

                  return (
                    <div key={player.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-600 text-white text-xs">{player.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-slate-300">{player.name}</span>
                      </div>
                      <span className="text-white font-medium">{voteCount}</span>
                    </div>
                  )
                })}
                {Object.keys(state.votes).length === 0 && <p className="text-slate-400 text-sm">No votes yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
