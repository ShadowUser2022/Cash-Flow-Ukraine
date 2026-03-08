import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { GameSocketHandler } from './sockets/gameSocketHandler';
import { WebRTCSocketHandler } from './sockets/webrtcSocketHandler';
import { gameRoutes } from './controllers/gameController';
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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashflow';

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

// Socket.io namespaces
const gameNamespace = io.of('/game');
const webrtcNamespace = io.of('/webrtc');

// Ініціалізуємо Socket handlers
const gameSocketHandler = new GameSocketHandler(gameNamespace);
const webrtcSocketHandler = new WebRTCSocketHandler(webrtcNamespace);

// Make socket namespaces available to the app
app.set('gameNamespace', gameNamespace);
app.set('webrtcNamespace', webrtcNamespace);
app.set('gameSocketHandler', gameSocketHandler);

gameNamespace.on('connection', (socket) => {
  console.log(`Game client connected: ${socket.id}`);
  gameSocketHandler.handleConnection(socket);
});

webrtcNamespace.on('connection', (socket) => {
  console.log(`WebRTC client connected: ${socket.id}`);
  webrtcSocketHandler.handleConnection(socket);
});

// Підключення до MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Запускаємо сервер
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Game namespace: /game`);
      console.log(`WebRTC namespace: /webrtc`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

export { io, app };
