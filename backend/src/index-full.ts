import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
// import mongoose from 'mongoose'; // Тимчасово відключено
// import { GameSocketHandler } from './sockets/gameSocketHandler';
// import { WebRTCSocketHandler } from './sockets/webrtcSocketHandler';
import { gameRoutes } from './controllers/gameController-memory';
import { errorMiddleware } from './middleware/errorMiddleware';

// Завантажуємо змінні середовища
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174", 
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174", 
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177"
  ]
}));
app.use(express.json());

// Routes
app.use('/api/games', gameRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Full Cash Flow backend працює!' });
});

// Socket.io для real-time комунікації
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Приєднання до кімнати гри
  socket.on('joinGame', (gameId: string) => {
    socket.join(gameId);
    console.log(`Socket ${socket.id} joined game ${gameId}`);
    socket.to(gameId).emit('playerJoined', { socketId: socket.id });
  });
  
  // Покидання кімнати гри
  socket.on('leaveGame', (gameId: string) => {
    socket.leave(gameId);
    console.log(`Socket ${socket.id} left game ${gameId}`);
    socket.to(gameId).emit('playerLeft', { socketId: socket.id });
  });
  
  // Оновлення готовності гравця
  socket.on('playerReady', (data: { gameId: string, playerId: string, isReady: boolean }) => {
    socket.to(data.gameId).emit('playerReadyUpdate', data);
  });
  
  // Початок гри
  socket.on('gameStarted', (gameId: string) => {
    io.to(gameId).emit('gameStarted', { gameId });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Запускаємо сервер без MongoDB
console.log('🚀 Starting Cash Flow server...');
server.listen(PORT, () => {
  console.log(`🎮 Cash Flow server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
  console.log(`💊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Game API: http://localhost:${PORT}/api/games`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

export { io, app };
