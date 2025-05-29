const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

// Store active rooms and their data
const rooms = new Map();

// Generate a random 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

console.log('WebSocket server is running on ws://localhost:3001');

wss.on('connection', function connection(ws) {
  console.log('New client connected');
  ws.isAlive = true;

  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      switch (data.type) {
        case 'create-room': {
          const roomCode = generateRoomCode();
          const room = {
            code: roomCode,
            name: data.roomName,
            password: data.password,
            maxPlayers: data.maxPlayers || 8,
            players: [],
            host: data.player,
            phase: 'lobby',
          };

          // Add the host player to the room
          room.players.push(data.player);
          rooms.set(roomCode, room);

          // Associate this connection with the room and player
          ws.roomCode = roomCode;
          ws.playerId = data.player.id;

          // Send room created confirmation
          ws.send(JSON.stringify({
            type: 'room-created',
            data: {
              roomCode,
              roomName: room.name,
              roomPassword: room.password,
              maxPlayers: room.maxPlayers,
              players: room.players,
              currentPlayer: data.player,
              phase: 'lobby'
            }
          }));
          break;
        }

        case 'join-room': {
          const { roomCode, password, player } = data;
          const room = rooms.get(roomCode);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Room not found' }
            }));
            break;
          }

          if (room.password && room.password !== password) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Incorrect password' }
            }));
            break;
          }

          if (room.players.length >= room.maxPlayers) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: 'Room is full' }
            }));
            break;
          }

          // Add player to room
          room.players.push(player);
          ws.roomCode = roomCode;
          ws.playerId = player.id;

          // Notify all players in the room
          room.players.forEach(p => {
            const playerWs = [...wss.clients].find(client => client.playerId === p.id);
            if (playerWs && playerWs.readyState === WebSocket.OPEN) {
              playerWs.send(JSON.stringify({
                type: 'player-joined',
                data: {
                  roomCode,
                  roomName: room.name,
                  roomPassword: room.password,
                  maxPlayers: room.maxPlayers,
                  players: room.players,
                  currentPlayer: p.id === player.id ? player : null,
                  phase: room.phase
                }
              }));
            }
          });
          break;
        }

        case 'leave-room': {
          const { roomCode, playerId } = data;
          const room = rooms.get(roomCode);

          if (room) {
            // Remove player from room
            room.players = room.players.filter(p => p.id !== playerId);

            if (room.players.length === 0) {
              // Delete empty room
              rooms.delete(roomCode);
            } else {
              // If host left, assign new host
              if (room.host.id === playerId) {
                room.host = room.players[0];
                room.players[0].isHost = true;
              }

              // Notify remaining players
              room.players.forEach(p => {
                const playerWs = [...wss.clients].find(client => client.playerId === p.id);
                if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                  playerWs.send(JSON.stringify({
                    type: 'player-left',
                    data: {
                      playerId,
                      players: room.players,
                      host: room.host
                    }
                  }));
                }
              });
            }
          }
          break;
        }

        case 'toggle-ready': {
          const { roomCode, playerId, isReady } = data;
          const room = rooms.get(roomCode);

          if (room) {
            // Update player's ready status
            const player = room.players.find(p => p.id === playerId);
            if (player) {
              player.isReady = isReady;

              // Notify all players in the room
              room.players.forEach(p => {
                const playerWs = [...wss.clients].find(client => client.playerId === p.id);
                if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                  playerWs.send(JSON.stringify({
                    type: 'player-ready',
                    data: {
                      playerId,
                      isReady,
                      players: room.players
                    }
                  }));
                }
              });

              // Check if all players are ready and there are at least 4 players
              if (room.players.length >= 4 && room.players.every(p => p.isReady)) {
                // Start the game
                room.phase = 'night';
                room.players.forEach(p => {
                  const playerWs = [...wss.clients].find(client => client.playerId === p.id);
                  if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                    playerWs.send(JSON.stringify({
                      type: 'game-started',
                      data: {
                        phase: room.phase,
                        players: room.players
                      }
                    }));
                  }
                });
              }
            }
          }
          break;
        }

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Invalid message format' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.roomCode && ws.playerId) {
      const room = rooms.get(ws.roomCode);
      if (room) {
        // Remove player from room
        room.players = room.players.filter(p => p.id !== ws.playerId);
        if (room.players.length === 0) {
          // Delete empty room
          rooms.delete(ws.roomCode);
        } else {
          // Notify remaining players
          room.players.forEach(player => {
            const playerWs = [...wss.clients].find(client => client.playerId === player.id);
            if (playerWs && playerWs.readyState === WebSocket.OPEN) {
              playerWs.send(JSON.stringify({
                type: 'player-left',
                data: { playerId: ws.playerId }
              }));
            }
          });
        }
      }
    }
  });

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    data: { message: 'Connected to game server' }
  }));
});

// Ping clients every 30 seconds to keep connections alive
const interval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
