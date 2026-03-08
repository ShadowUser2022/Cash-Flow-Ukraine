#!/usr/bin/env node

/**
 * Enhanced Cash Flow Ukraine Server Launcher
 * Professional production-ready server with TypeScript integration
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// TypeScript runtime compilation
const { register } = require('ts-node');
register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    target: 'es2018',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true
  }
});

// Configuration
const { SERVER_CONFIG } = require('../config/server.config.ts');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: SERVER_CONFIG.CORS_ORIGINS,
    methods: ["GET", "POST", "PATCH", "DELETE"]
  },
  pingTimeout: SERVER_CONFIG.SOCKET.PING_TIMEOUT,
  pingInterval: SERVER_CONFIG.SOCKET.PING_INTERVAL
});

// Middleware
app.use(cors({
  origin: SERVER_CONFIG.CORS_ORIGINS
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  if (SERVER_CONFIG.DEBUG.ENABLE_LOGGING) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-enhanced',
    environment: SERVER_CONFIG.NODE_ENV
  });
});

// API Routes - Import TypeScript controllers
try {
  const { gameRoutes } = require('../src/controllers/gameController-memory.ts');
  app.use('/api/games', gameRoutes);
  console.log('✅ Game routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load game routes:', error.message);
  process.exit(1);
}

// Socket.IO Real-time handlers
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Game lobby events
  socket.on('joinGame', ({ gameId, playerId }) => {
    console.log(`👤 Player ${playerId} joining game ${gameId}`);
    socket.join(gameId);
    connectedUsers.set(socket.id, { gameId, playerId });
    socket.to(gameId).emit('playerJoined', { playerId });
  });

  socket.on('leaveGame', ({ gameId, playerId }) => {
    console.log(`👋 Player ${playerId} leaving game ${gameId}`);
    socket.leave(gameId);
    connectedUsers.delete(socket.id);
    socket.to(gameId).emit('playerLeft', { playerId });
  });

  // Game state events
  socket.on('playerReady', ({ gameId, playerId, isReady }) => {
    socket.to(gameId).emit('playerReadyStatusChanged', { playerId, isReady });
  });

  socket.on('gameStarted', ({ gameId }) => {
    console.log(`🎮 Game ${gameId} started`);
    io.to(gameId).emit('gameStarted', { gameId });
  });

  // Game mechanics events
  socket.on('diceRolled', ({ gameId, playerId, result }) => {
    console.log(`🎲 Player ${playerId} rolled ${result.diceResult} in game ${gameId}`);
    io.to(gameId).emit('diceRolled', { playerId, result });
  });

  socket.on('turnEnded', ({ gameId, playerId, nextPlayer }) => {
    console.log(`⏭️ Turn ended for ${playerId}, next: ${nextPlayer} in game ${gameId}`);
    io.to(gameId).emit('turnEnded', { playerId, nextPlayer });
  });

  socket.on('dealDrawn', ({ gameId, playerId, deal }) => {
    socket.to(gameId).emit('dealDrawn', { playerId, deal });
  });

  socket.on('dealExecuted', ({ gameId, playerId, dealId, action }) => {
    socket.to(gameId).emit('dealExecuted', { playerId, dealId, action });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`🔌 Player ${user.playerId} disconnected from game ${user.gameId}`);
      socket.to(user.gameId).emit('playerDisconnected', { playerId: user.playerId });
      connectedUsers.delete(socket.id);
    }
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: SERVER_CONFIG.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('📛 Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(SERVER_CONFIG.PORT, () => {
  console.log('🚀 Cash Flow Ukraine Server Enhanced Started!');
  console.log(`🎮 Server running on port ${SERVER_CONFIG.PORT}`);
  console.log(`🌍 Environment: ${SERVER_CONFIG.NODE_ENV}`);
  console.log('📡 Socket.IO ready');
  console.log('💼 TypeScript game mechanics enabled');
  console.log(`🌐 Frontend: http://localhost:5173`);
  console.log(`💊 Health: http://localhost:${SERVER_CONFIG.PORT}/health`);
  console.log(`🎯 API: http://localhost:${SERVER_CONFIG.PORT}/api/games`);
  console.log('=====================================');
});

module.exports = { app, server, io };
