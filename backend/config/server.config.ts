// Backend Configuration
// Enhanced Cash Flow Ukraine Server Configuration

import { config } from 'dotenv';
config();

export const SERVER_CONFIG = {
  // Server Settings
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS Settings
  CORS_ORIGINS: [
    'http://localhost:5173',  // Frontend dev
    'http://localhost:3000',  // Alternative frontend
    ...(process.env.ADDITIONAL_CORS_ORIGINS?.split(',') || [])
  ],
  
  // Game Settings
  GAME: {
    MAX_PLAYERS: 6,
    MIN_PLAYERS: 2,
    GAME_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    TURN_TIMEOUT: 5 * 60 * 1000,       // 5 minutes
  },
  
  // Socket.IO Settings
  SOCKET: {
    PING_TIMEOUT: 60000,
    PING_INTERVAL: 25000,
  },
  
  // Development Settings
  DEBUG: {
    ENABLE_LOGGING: process.env.DEBUG_LOGGING === 'true',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  }
};

export const DATABASE_CONFIG = {
  // In-memory storage settings
  MEMORY_CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
  MAX_GAMES_IN_MEMORY: 1000,
  
  // MongoDB settings (для майбутнього використання)
  MONGODB: {
    URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cashflow',
    OPTIONS: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  }
};

export default {
  SERVER_CONFIG,
  DATABASE_CONFIG
};
