import { type NextRequest } from 'next/server';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
  avatar: string;
}

interface Room {
  code: string;
  name: string;
  password?: string;
  maxPlayers: number;
  players: Player[];
  host: Player;
  phase: 'lobby' | 'night' | 'day';
}

interface GameMessage {
  type: string;
  roomName?: string;
  password?: string;
  maxPlayers?: number;
  player?: Player;
  roomCode?: string;
  playerId?: string;
  isReady?: boolean;
}

type WebSocketConnection = {
  socket: WebSocket;
  roomCode: string | null;
  playerId: string | null;
};

// Store active rooms and their data
const rooms = new Map<string, Room>();

// Store WebSocket connections
const connections = new Map<string, WebSocketConnection>();

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper function to broadcast to all clients in a room
function broadcastToRoom(roomCode: string, message: any) {
  connections.forEach((conn) => {
    if (conn.roomCode === roomCode && conn.socket.readyState === 1) {
      conn.socket.send(JSON.stringify(message));
    }
  });
}

// Helper function to handle WebSocket messages
async function handleMessage(socketId: string, conn: WebSocketConnection, data: string) {
  try {
    const message = JSON.parse(data) as GameMessage;
    console.log('Received:', message);

    if (!message.type) {
      conn.socket.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' }
      }));
      return;
    }

    switch (message.type) {
      case 'create-room': {
        if (!message.roomName || !message.player) {
          conn.socket.send(JSON.stringify({
            type: 'error',
            data: { message: 'Missing required fields' }
          }));
          return;
        }

        const roomCode = generateRoomCode();
        const room: Room = {
          code: roomCode,
          name: message.roomName,
          password: message.password,
          maxPlayers: message.maxPlayers || 8,
          players: [message.player],
          host: message.player,
          phase: 'lobby'
        };

        rooms.set(roomCode, room);
        conn.roomCode = roomCode;
        conn.playerId = message.player.id;

        conn.socket.send(JSON.stringify({
          type: 'room-created',
          data: {
            roomCode,
            roomName: room.name,
            roomPassword: room.password,
            maxPlayers: room.maxPlayers,
            players: room.players,
            currentPlayer: message.player,
            phase: room.phase
          }
        }));
        break;
      }

      case 'join-room': {
        if (!message.roomCode || !message.player) {
          conn.socket.send(JSON.stringify({
            type: 'error',
            data: { message: 'Missing required fields' }
          }));
          return;
        }

        const room = rooms.get(message.roomCode);
        if (!room) {
          conn.socket.send(JSON.stringify({
            type: 'error',
            data: { message: 'Room not found' }
          }));
          return;
        }

        if (room.password && room.password !== message.password) {
          conn.socket.send(JSON.stringify({
            type: 'error',
            data: { message: 'Incorrect password' }
          }));
          return;
        }

        if (room.players.length >= room.maxPlayers) {
          conn.socket.send(JSON.stringify({
            type: 'error',
            data: { message: 'Room is full' }
          }));
          return;
        }

        room.players.push(message.player);
        conn.roomCode = message.roomCode;
        conn.playerId = message.player.id;

        broadcastToRoom(message.roomCode, {
          type: 'player-joined',
          data: {
            roomCode: message.roomCode,
            roomName: room.name,
            roomPassword: room.password,
            maxPlayers: room.maxPlayers,
            players: room.players,
            currentPlayer: message.player,
            phase: room.phase
          }
        });
        break;
      }

      case 'leave-room': {
        if (!conn.roomCode || !conn.playerId) return;

        const room = rooms.get(conn.roomCode);
        if (!room) return;

        room.players = room.players.filter(p => p.id !== conn.playerId);

        if (room.players.length === 0) {
          rooms.delete(conn.roomCode);
        } else {
          if (room.host.id === conn.playerId) {
            room.host = room.players[0];
            room.players[0].isHost = true;
          }

          broadcastToRoom(conn.roomCode, {
            type: 'player-left',
            data: {
              playerId: conn.playerId,
              players: room.players,
              host: room.host
            }
          });
        }

        conn.roomCode = null;
        conn.playerId = null;
        break;
      }

      case 'toggle-ready': {
        if (!conn.roomCode || !conn.playerId || message.isReady === undefined) return;

        const room = rooms.get(conn.roomCode);
        if (!room) return;

        const player = room.players.find(p => p.id === conn.playerId);
        if (!player) return;

        player.isReady = message.isReady;

        broadcastToRoom(conn.roomCode, {
          type: 'player-ready',
          data: {
            playerId: conn.playerId,
            isReady: message.isReady,
            players: room.players
          }
        });

        // Check if all players are ready and there are at least 4 players
        if (room.players.length >= 4 && room.players.every(p => p.isReady)) {
          room.phase = 'night';
          broadcastToRoom(conn.roomCode, {
            type: 'game-started',
            data: {
              phase: room.phase,
              players: room.players
            }
          });
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    conn.socket.send(JSON.stringify({
      type: 'error',
      data: { message: 'Invalid message format' }
    }));
  }
}

export const runtime = 'edge';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface WebSocketConnection {
  socket: WebSocket;
  roomCode: string | null;
  playerId: string | null;
}

function generateAcceptKey(key: string): string {
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  const crypto = require('crypto');
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + GUID)
    .digest('base64');
  return acceptKey;
}

function acceptWebSocket(req: NextRequest): Response {
  const socketKey = req.headers.get('sec-websocket-key') || '';
  const acceptKey = generateAcceptKey(socketKey);
  const socketProtocol = req.headers.get('sec-websocket-protocol') || '';

  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
      'Sec-WebSocket-Accept': acceptKey,
      'Sec-WebSocket-Protocol': socketProtocol
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    if (req.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    if (!req.headers.get('upgrade') || req.headers.get('upgrade').toLowerCase() !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const socketKey = req.headers.get('sec-websocket-key');
    if (!socketKey) {
      return new Response('Missing Sec-WebSocket-Key', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const socketId = Math.random().toString(36).substring(7);

    const connection: WebSocketConnection = {
      socket: server as WebSocket,
      roomCode: null,
      playerId: null
    };

    connections.set(socketId, connection);

    server.addEventListener('message', async (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data.toString());
        await handleMessage(socketId, connection, JSON.stringify(message));
      } catch (error) {
        console.error('Error handling message:', error);
        server.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    server.addEventListener('close', () => {
      const conn = connections.get(socketId);
      if (conn?.roomCode && conn.playerId) {
        const room = rooms.get(conn.roomCode);
        if (room) {
          const playerIndex = room.players.findIndex(p => p.id === conn.playerId);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            if (room.players.length === 0) {
              rooms.delete(conn.roomCode);
            } else {
              if (room.host.id === conn.playerId) {
                room.host = room.players[0];
                room.players[0].isHost = true;
              }
              broadcastToRoom(conn.roomCode, {
                type: 'player-left',
                data: {
                  playerId: conn.playerId,
                  players: room.players,
                  host: room.host
                }
              });
            }
          }
        }
      }
      connections.delete(socketId);
    });

    server.addEventListener('error', (error: Event) => {
      console.error('WebSocket error:', error);
      connections.delete(socketId);
    });

    server.accept();

    return new Response(null, {
      status: 101,
      webSocket: client
    });

  } catch (error) {
    console.error('WebSocket upgrade failed:', error);
    return new Response('WebSocket upgrade failed', { status: 500 });
  }
}
