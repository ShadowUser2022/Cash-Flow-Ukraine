// Transaction Model for Cash Flow Ukraine
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  playerId: string;
  gameId: string;
  type: 'salary' | 'expense' | 'income' | 'asset_purchase' | 'asset_sale' | 'loan' | 'payment' | 'deal' | 'market_event' | 'tax' | 'charity';
  amount: number;
  description: string;
  category?: string;
  fromPlayer?: string;
  toPlayer?: string;
  metadata?: {
    assetId?: string;
    dealId?: string;
    cellPosition?: number;
    previousBalance?: number;
    newBalance?: number;
  };
  timestamp: Date;
  isProcessed: boolean;
  processedAt?: Date;
}

const TransactionSchema: Schema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  playerId: {
    type: String,
    required: true,
    index: true
  },
  gameId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['salary', 'expense', 'income', 'asset_purchase', 'asset_sale', 'loan', 'payment', 'deal', 'market_event', 'tax', 'charity'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  fromPlayer: {
    type: String,
    index: true
  },
  toPlayer: {
    type: String,
    index: true
  },
  metadata: {
    assetId: String,
    dealId: String,
    cellPosition: Number,
    previousBalance: Number,
    newBalance: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isProcessed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'transactions'
});

// Pre-save middleware
TransactionSchema.pre('save', function(next) {
  if (this.isProcessed && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

// Static methods
TransactionSchema.statics.findByPlayerId = function(playerId: string) {
  return this.find({ playerId }).sort({ timestamp: -1 });
};

TransactionSchema.statics.findByGameId = function(gameId: string) {
  return this.find({ gameId }).sort({ timestamp: -1 });
};

TransactionSchema.statics.findByType = function(type: string) {
  return this.find({ type }).sort({ timestamp: -1 });
};

TransactionSchema.statics.findUnprocessed = function() {
  return this.find({ isProcessed: false });
};

TransactionSchema.statics.createTransaction = function(transactionData: Partial<ITransaction>) {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return this.create({ ...transactionData, transactionId });
};

// Instance methods
TransactionSchema.methods.process = function() {
  this.isProcessed = true;
  this.processedAt = new Date();
  return this.save();
};

TransactionSchema.methods.reverse = function() {
  // Create a reversal transaction
  const reversalData = {
    playerId: this.playerId,
    gameId: this.gameId,
    type: this.type,
    amount: -this.amount,
    description: `Reversal: ${this.description}`,
    category: 'reversal',
    fromPlayer: this.toPlayer,
    toPlayer: this.fromPlayer,
    metadata: {
      originalTransactionId: this.transactionId,
      originalAmount: this.amount
    }
  };
  
  return this.constructor.createTransaction(reversalData);
};

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

// Add static methods to the model
(Transaction as any).findByPlayerId = function(playerId: string) {
  return this.find({ playerId }).sort({ timestamp: -1 });
};

(Transaction as any).findByGameId = function(gameId: string) {
  return this.find({ gameId }).sort({ timestamp: -1 });
};

(Transaction as any).findByType = function(type: string) {
  return this.find({ type }).sort({ timestamp: -1 });
};

(Transaction as any).findUnprocessed = function() {
  return this.find({ isProcessed: false });
};

(Transaction as any).createTransaction = function(transactionData: Partial<ITransaction>) {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return this.create({ ...transactionData, transactionId });
};
export default Transaction;
