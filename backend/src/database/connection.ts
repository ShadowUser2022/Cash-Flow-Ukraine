// Database Connection for Cash Flow Ukraine
// MongoDB connection with Railway compatibility

import mongoose from 'mongoose';
import { DATABASE_CONFIG } from '../../config/server.config';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Already connected to MongoDB');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || DATABASE_CONFIG.MONGODB.URI;
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
      });

      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
      console.log(`📍 Database: ${mongoose.connection.name}`);
      
      // Create indexes for better performance
      await this.createIndexes();
      
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  public getConnection(): typeof mongoose {
    return mongoose;
  }

  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  private async createIndexes(): Promise<void> {
    try {
      // Game indexes
      const Game = mongoose.connection.collection('games');
      await Game.createIndex({ gameId: 1 }, { unique: true });
      await Game.createIndex({ status: 1 });
      await Game.createIndex({ createdAt: 1 });

      // Player indexes
      const Player = mongoose.connection.collection('players');
      await Player.createIndex({ playerId: 1 }, { unique: true });
      await Player.createIndex({ gameId: 1 });
      await Player.createIndex({ email: 1 });

      // Transaction indexes
      const Transaction = mongoose.connection.collection('transactions');
      await Transaction.createIndex({ playerId: 1 });
      await Transaction.createIndex({ gameId: 1 });
      await Transaction.createIndex({ timestamp: 1 });
      await Transaction.createIndex({ type: 1 });

      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.warn('⚠️ Warning: Could not create indexes:', error);
    }
  }

  // Health check for Railway
  public async healthCheck(): Promise<{ status: string; database: string; connected: boolean }> {
    try {
      if (!this.isConnectionActive()) {
        return { status: 'unhealthy', database: 'mongodb', connected: false };
      }

      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        database: 'mongodb',
        connected: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'mongodb',
        connected: false
      };
    }
  }
}

export default DatabaseConnection;
