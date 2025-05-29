"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface SocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  sendMessage: (type: string, data: any) => void
  lastMessage: any | null
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
  url: string
  onError: (message: string) => void
}

export function SocketProvider({ children, url, onError }: SocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const { toast } = useToast()

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        setIsConnected(true)
        console.log("WebSocket connected")
        toast({
          title: "Connected",
          description: "Successfully connected to game server",
        })
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("Received message:", data)
          setLastMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      ws.onclose = (event) => {
        setIsConnected(false)
        console.log("WebSocket disconnected:", event.code, event.reason)

        // Don't attempt to reconnect if the close was clean (code 1000)
        if (event.code !== 1000) {
          toast({
            variant: "destructive",
            title: "Disconnected",
            description: "Lost connection to game server. Reconnecting...",
          })

          // Auto-reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        onError("Failed to connect to game server. Please try again later.")
      }

      socketRef.current = ws
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error)
      onError("Failed to connect to game server. Please check your internet connection.")
    }
  }

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      if (socketRef.current) {
        // Use code 1000 for normal closure
        socketRef.current.close(1000, "Component unmounted")
      }
    }
  }, [url])

  const sendMessage = (type: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.warn("Cannot send message, socket not connected")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Not connected to game server",
      })
      return;
    }

    try {
      const message = JSON.stringify({
        type,
        ...data,
        timestamp: Date.now(),
      })

      socketRef.current.send(message)
    } catch (error) {
      console.error('Error sending message:', error);
      onError('Failed to send message to server.');
    }
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage, lastMessage }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
