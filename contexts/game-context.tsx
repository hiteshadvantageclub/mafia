"use client"

import type React from "react"

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react"
import { useSocket } from "@/contexts/socket-context"
import { useToast } from "@/components/ui/use-toast"
import type { GameScreen } from "@/app/page"

export type Role = "mafia" | "villager" | "doctor" | "detective"

export interface Player {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  isAlive: boolean
  role?: Role
  avatar: string
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
  isMafiaChat?: boolean
}

export interface GameState {
  roomCode: string
  roomName: string
  roomPassword?: string
  maxPlayers: number
  players: Player[]
  currentPlayer: Player | null
  phase: GameScreen
  timer: number
  dayCount: number
  nightCount: number
  votes: Record<string, string>
  nightActions: Record<string, string>
  eliminatedPlayer: Player | null
  winner: "mafia" | "villagers" | null
  chatMessages: ChatMessage[]
  mafiaChat: boolean
  loading: boolean
  error: string | null
}

type GameAction =
  | { type: "SET_ROOM_CODE"; payload: string }
  | { type: "SET_ROOM_NAME"; payload: string }
  | { type: "SET_ROOM_PASSWORD"; payload: string }
  | { type: "SET_MAX_PLAYERS"; payload: number }
  | { type: "SET_CURRENT_PLAYER"; payload: Player }
  | { type: "SET_PLAYERS"; payload: Player[] }
  | { type: "ADD_PLAYER"; payload: Player }
  | { type: "REMOVE_PLAYER"; payload: string }
  | { type: "UPDATE_PLAYER"; payload: Partial<Player> & { id: string } }
  | { type: "SET_PHASE"; payload: GameScreen }
  | { type: "SET_TIMER"; payload: number }
  | { type: "INCREMENT_DAY" }
  | { type: "INCREMENT_NIGHT" }
  | { type: "ADD_VOTE"; payload: { voterId: string; targetId: string } }
  | { type: "CLEAR_VOTES" }
  | { type: "ADD_NIGHT_ACTION"; payload: { playerId: string; targetId: string } }
  | { type: "CLEAR_NIGHT_ACTIONS" }
  | { type: "SET_ELIMINATED_PLAYER"; payload: Player }
  | { type: "SET_WINNER"; payload: "mafia" | "villagers" }
  | { type: "ADD_CHAT_MESSAGE"; payload: Omit<ChatMessage, "id" | "timestamp"> }
  | { type: "TOGGLE_MAFIA_CHAT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_GAME" }
  | { type: "UPDATE_GAME_STATE"; payload: Partial<GameState> }

const initialState: GameState = {
  roomCode: "",
  roomName: "",
  roomPassword: "",
  maxPlayers: 8,
  players: [],
  currentPlayer: null,
  phase: "welcome",
  timer: 0,
  dayCount: 0,
  nightCount: 0,
  votes: {},
  nightActions: {},
  eliminatedPlayer: null,
  winner: null,
  chatMessages: [],
  mafiaChat: false,
  loading: false,
  error: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_ROOM_CODE":
      return { ...state, roomCode: action.payload }
    case "SET_ROOM_NAME":
      return { ...state, roomName: action.payload }
    case "SET_ROOM_PASSWORD":
      return { ...state, roomPassword: action.payload }
    case "SET_MAX_PLAYERS":
      return { ...state, maxPlayers: action.payload }
    case "SET_CURRENT_PLAYER":
      return { ...state, currentPlayer: action.payload }
    case "SET_PLAYERS":
      return { ...state, players: action.payload }
    case "ADD_PLAYER":
      return { ...state, players: [...state.players, action.payload] }
    case "REMOVE_PLAYER":
      return { ...state, players: state.players.filter((p) => p.id !== action.payload) }
    case "UPDATE_PLAYER":
      return {
        ...state,
        players: state.players.map((p) => (p.id === action.payload.id ? { ...p, ...action.payload } : p)),
        currentPlayer:
          state.currentPlayer?.id === action.payload.id
            ? { ...state.currentPlayer, ...action.payload }
            : state.currentPlayer,
      }
    case "SET_PHASE":
      return { ...state, phase: action.payload }
    case "SET_TIMER":
      return { ...state, timer: action.payload }
    case "INCREMENT_DAY":
      return { ...state, dayCount: state.dayCount + 1 }
    case "INCREMENT_NIGHT":
      return { ...state, nightCount: state.nightCount + 1 }
    case "ADD_VOTE":
      return {
        ...state,
        votes: { ...state.votes, [action.payload.voterId]: action.payload.targetId },
      }
    case "CLEAR_VOTES":
      return { ...state, votes: {} }
    case "ADD_NIGHT_ACTION":
      return {
        ...state,
        nightActions: { ...state.nightActions, [action.payload.playerId]: action.payload.targetId },
      }
    case "CLEAR_NIGHT_ACTIONS":
      return { ...state, nightActions: {} }
    case "SET_ELIMINATED_PLAYER":
      return { ...state, eliminatedPlayer: action.payload }
    case "SET_WINNER":
      return { ...state, winner: action.payload }
    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [
          ...state.chatMessages,
          {
            id: Date.now().toString(),
            ...action.payload,
            timestamp: Date.now(),
          },
        ],
      }
    case "TOGGLE_MAFIA_CHAT":
      return { ...state, mafiaChat: !state.mafiaChat }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "RESET_GAME":
      return {
        ...initialState,
        roomCode: state.roomCode,
        roomName: state.roomName,
        roomPassword: state.roomPassword,
        maxPlayers: state.maxPlayers,
        players: state.players.map((p) => ({
          ...p,
          isReady: false,
          isAlive: true,
          role: undefined,
        })),
        currentPlayer: state.currentPlayer
          ? {
              ...state.currentPlayer,
              isReady: false,
              isAlive: true,
              role: undefined,
            }
          : null,
      }
    case "UPDATE_GAME_STATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  createRoom: (name: string, playerName: string, password?: string, maxPlayers?: number) => void
  joinRoom: (code: string, playerName: string, password?: string) => void
  leaveRoom: () => void
  toggleReady: () => void
  startGame: () => void
  submitNightAction: (targetId: string) => void
  submitVote: (targetId: string) => void
  sendChatMessage: (message: string) => void
  kickPlayer: (playerId: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

interface GameProviderProps {
  children: ReactNode
  onScreenChange: (screen: GameScreen) => void
}

export function GameProvider({ children, onScreenChange }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { sendMessage, lastMessage, isConnected } = useSocket()
  const { toast } = useToast()

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return

    console.log("Processing message:", lastMessage)

    switch (lastMessage.type) {
      case "room-created":
        dispatch({ type: "UPDATE_GAME_STATE", payload: lastMessage.data })
        onScreenChange("lobby")
        break
      case "player-joined":
        if (lastMessage.data.currentPlayer) {
          // This is a response to joining a room
          dispatch({ type: "UPDATE_GAME_STATE", payload: lastMessage.data })
          onScreenChange("lobby")
        } else {
          // This is a notification that another player joined
          const newPlayer = lastMessage.data.players.find(
            (p: Player) => !state.players.some((existing) => existing.id === p.id)
          )
          if (newPlayer) {
            dispatch({ type: "ADD_PLAYER", payload: newPlayer })
            toast({
              title: "Player Joined",
              description: `${newPlayer.name} has joined the room`,
            })
          }
        }
        break
      case "player-left":
        dispatch({ type: "REMOVE_PLAYER", payload: lastMessage.data.playerId })
        toast({
          title: "Player Left",
          description: `${lastMessage.data.playerName} has left the room`,
        })
        break
      case "player-ready":
        dispatch({
          type: "UPDATE_PLAYER",
          payload: { id: lastMessage.data.playerId, isReady: lastMessage.data.isReady },
        })
        break
      case "player-kicked":
        if (state.currentPlayer?.id === lastMessage.data.playerId) {
          toast({
            variant: "destructive",
            title: "Kicked",
            description: "You have been kicked from the room",
          })
          onScreenChange("welcome")
        } else {
          dispatch({ type: "REMOVE_PLAYER", payload: lastMessage.data.playerId })
          toast({
            title: "Player Kicked",
            description: `${lastMessage.data.playerName} has been kicked from the room`,
          })
        }
        break
      case "game-started":
        dispatch({ type: "UPDATE_GAME_STATE", payload: lastMessage.data })
        onScreenChange("role-assignment")
        break
      case "role-assigned":
        dispatch({
          type: "UPDATE_PLAYER",
          payload: { id: lastMessage.data.playerId, role: lastMessage.data.role },
        })
        break
      case "phase-changed":
        dispatch({ type: "SET_PHASE", payload: lastMessage.data.phase })
        dispatch({ type: "SET_TIMER", payload: lastMessage.data.timer })

        if (lastMessage.data.phase === "night") {
          dispatch({ type: "INCREMENT_NIGHT" })
        } else if (lastMessage.data.phase === "day") {
          dispatch({ type: "INCREMENT_DAY" })
        }

        onScreenChange(lastMessage.data.phase)
        break
      case "timer-update":
        dispatch({ type: "SET_TIMER", payload: lastMessage.data.timer })
        break
      case "night-action-received":
        dispatch({
          type: "ADD_NIGHT_ACTION",
          payload: { playerId: lastMessage.data.playerId, targetId: lastMessage.data.targetId },
        })
        break
      case "vote-received":
        dispatch({
          type: "ADD_VOTE",
          payload: { voterId: lastMessage.data.voterId, targetId: lastMessage.data.targetId },
        })
        break
      case "player-eliminated":
        dispatch({ type: "SET_ELIMINATED_PLAYER", payload: lastMessage.data.player })
        dispatch({
          type: "UPDATE_PLAYER",
          payload: { id: lastMessage.data.player.id, isAlive: false },
        })
        onScreenChange("elimination")
        break
      case "chat-message":
        dispatch({
          type: "ADD_CHAT_MESSAGE",
          payload: {
            playerId: lastMessage.data.playerId,
            playerName: lastMessage.data.playerName,
            message: lastMessage.data.message,
            isMafiaChat: lastMessage.data.isMafiaChat,
          },
        })
        break
      case "game-over":
        dispatch({ type: "SET_WINNER", payload: lastMessage.data.winner })
        onScreenChange("game-over")
        break
      case "error":
        dispatch({ type: "SET_ERROR", payload: lastMessage.data.message })
        toast({
          variant: "destructive",
          title: "Error",
          description: lastMessage.data.message,
        })
        break
    }
  }, [lastMessage, onScreenChange, toast])

  // Monitor connection status
  useEffect(() => {
    if (!isConnected && state.phase !== "welcome" && state.phase !== "create-room") {
      dispatch({ type: "SET_LOADING", payload: true })
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [isConnected, state.phase])

  // Game actions
  const createRoom = (name: string, playerName: string, password?: string, maxPlayers = 8) => {
    dispatch({ type: "SET_LOADING", payload: true })

    const player: Player = {
      id: Date.now().toString(),
      name: playerName,
      isHost: true,
      isReady: true,
      isAlive: true,
      avatar: playerName.charAt(0).toUpperCase(),
    }

    dispatch({ type: "SET_CURRENT_PLAYER", payload: player })

    sendMessage("create-room", {
      roomName: name,
      password,
      maxPlayers,
      player,
    })
  }

  const joinRoom = (code: string, playerName: string, password?: string) => {
    dispatch({ type: "SET_LOADING", payload: true })

    const player: Player = {
      id: Date.now().toString(),
      name: playerName,
      isHost: false,
      isReady: false,
      isAlive: true,
      avatar: playerName.charAt(0).toUpperCase(),
    }

    dispatch({ type: "SET_CURRENT_PLAYER", payload: player })

    sendMessage("join-room", {
      roomCode: code,
      password,
      player,
    })
  }

  const leaveRoom = () => {
    if (state.currentPlayer) {
      sendMessage("leave-room", {
        roomCode: state.roomCode,
        playerId: state.currentPlayer.id,
      })
    }

    dispatch({ type: "RESET_GAME" })
    onScreenChange("welcome")
  }

  const toggleReady = () => {
    if (!state.currentPlayer) return

    const newReadyState = !state.currentPlayer.isReady

    sendMessage("toggle-ready", {
      roomCode: state.roomCode,
      playerId: state.currentPlayer.id,
      isReady: newReadyState,
    })

    dispatch({
      type: "UPDATE_PLAYER",
      payload: { id: state.currentPlayer.id, isReady: newReadyState },
    })
  }

  const startGame = () => {
    if (!state.currentPlayer?.isHost) return

    sendMessage("start-game", {
      roomCode: state.roomCode,
    })
  }

  const submitNightAction = (targetId: string) => {
    if (!state.currentPlayer) return

    sendMessage("night-action", {
      roomCode: state.roomCode,
      playerId: state.currentPlayer.id,
      targetId,
      role: state.currentPlayer.role,
    })

    dispatch({
      type: "ADD_NIGHT_ACTION",
      payload: { playerId: state.currentPlayer.id, targetId },
    })
  }

  const submitVote = (targetId: string) => {
    if (!state.currentPlayer) return

    sendMessage("vote", {
      roomCode: state.roomCode,
      voterId: state.currentPlayer.id,
      targetId,
    })

    dispatch({
      type: "ADD_VOTE",
      payload: { voterId: state.currentPlayer.id, targetId },
    })
  }

  const sendChatMessage = (message: string) => {
    if (!state.currentPlayer || !message.trim()) return

    sendMessage("chat-message", {
      roomCode: state.roomCode,
      playerId: state.currentPlayer.id,
      playerName: state.currentPlayer.name,
      message: message.trim(),
      isMafiaChat: state.mafiaChat,
    })
  }

  const kickPlayer = (playerId: string) => {
    if (!state.currentPlayer?.isHost) return

    sendMessage("kick-player", {
      roomCode: state.roomCode,
      playerId,
    })
  }

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        startGame,
        submitNightAction,
        submitVote,
        sendChatMessage,
        kickPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
