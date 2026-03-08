// Enhanced JS запускач для повного Cash Flow backend з TypeScript інтеграцією
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Для компіляції TypeScript в runtime
require('ts-node/register');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// In-memory storage для ігор
const games = new Map();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173"]
}));
app.use(express.json());

// Генерація ID гри
function generateGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Створити гру
app.post('/api/games/create', (req, res) => {
  try {
    const { hostId } = req.body;
    if (!hostId) {
      return res.status(400).json({ error: 'Host ID is required' });
    }
    
    const gameId = generateGameId();
    const game = {
      id: gameId,
      hostId,
      players: [],
      state: 'waiting',
      currentPlayer: '',
      turn: 0,
      settings: {
        maxPlayers: 6,
        timeLimit: 3600,
        language: 'uk'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    games.set(gameId, game);
    
    res.status(201).json({
      success: true,
      game: {
        id: game.id,
        hostId: game.hostId,
        state: game.state,
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        createdAt: game.createdAt
      }
    });
    
    console.log(`🎮 Game created: ${gameId} by host: ${hostId}`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Отримати інформацію про гру
app.get('/api/games/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    const game = games.get(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({
      success: true,
      game: {
        id: game.id,
        hostId: game.hostId,
        players: game.players,
        state: game.state,
        currentPlayer: game.currentPlayer,
        turn: game.turn,
        settings: game.settings,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game' });
  }
});

// Приєднатися до гри
app.post('/api/games/:gameId/join', (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId, name, profession } = req.body;
    
    const game = games.get(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (game.players.length >= game.settings.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }
    
    const newPlayer = {
      id: playerId || `player_${Date.now()}`,
      name,
      profession: profession || { name: 'Студент', salary: 2000, expenses: 1500 },
      isReady: false,
      isConnected: true,
      joinedAt: new Date()
    };
    
    game.players.push(newPlayer);
    game.updatedAt = new Date();
    
    res.json({
      success: true,
      message: 'Successfully joined game',
      game: {
        id: game.id,
        playerCount: game.players.length,
        players: game.players
      }
    });
    
    // Повідомляємо всіх клієнтів про нового гравця
    io.to(gameId).emit('playerJoined', newPlayer);
    
    console.log(`👤 Player ${name} joined game ${gameId}`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to join game' });
  }
});

// Список ігор
app.get('/api/games', (req, res) => {
  try {
    const gamesList = Array.from(games.values())
      .filter(game => game.state === 'waiting')
      .map(game => ({
        id: game.id,
        hostId: game.hostId,
        playerCount: game.players.length,
        maxPlayers: game.settings.maxPlayers,
        state: game.state,
        createdAt: game.createdAt
      }));
    
    res.json({
      success: true,
      games: gamesList
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get games list' });
  }
});

// Socket.io для real-time комунікації
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('joinGame', (gameId) => {
    socket.join(gameId);
    console.log(`📡 Socket ${socket.id} joined game ${gameId}`);
    socket.to(gameId).emit('playerConnected', { socketId: socket.id });
  });
  
  socket.on('leaveGame', (gameId) => {
    socket.leave(gameId);
    console.log(`📤 Socket ${socket.id} left game ${gameId}`);
    socket.to(gameId).emit('playerDisconnected', { socketId: socket.id });
  });
  
  socket.on('playerReady', (data) => {
    console.log(`✅ Player ready update:`, data);
    socket.to(data.gameId).emit('playerReadyUpdate', data);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log('🚀 Cash Flow Ukraine Server Started!');
  console.log(`🎮 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`💊 Health: http://localhost:${PORT}/health`);
  console.log(`🎯 API: http://localhost:${PORT}/api/games`);
  console.log('=====================================');
});

module.exports = { app, server, io };
