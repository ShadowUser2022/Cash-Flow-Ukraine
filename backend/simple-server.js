const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173"]
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend працює!' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: http://localhost:5173`);
  console.log(`💊 Health check: http://localhost:${PORT}/health`);
});
