// Player Model for Cash Flow Ukraine
import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  playerId: string;
  name: string;
  email?: string;
  avatar?: string;
  profession: {
    name: string;
    salary: number;
    expenses: number;
    description: string;
  };
  finances: {
    salary: number;
    passiveIncome: number;
    expenses: number;
    cash: number;
    assets: any[];
    liabilities: any[];
  };
  position: number;
  fastTrackPosition: number;
  isOnFastTrack: boolean;
  isReady: boolean;
  gameId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

const PlayerSchema: Schema = new Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true,
    index: true
  },
  avatar: {
    type: String,
    default: ''
  },
  profession: {
    name: {
      type: String,
      required: true
    },
    salary: {
      type: Number,
      required: true
    },
    expenses: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  finances: {
    salary: {
      type: Number,
      default: 0
    },
    passiveIncome: {
      type: Number,
      default: 0
    },
    expenses: {
      type: Number,
      default: 0
    },
    cash: {
      type: Number,
      default: 400
    },
    assets: [{
      type: Schema.Types.Mixed
    }],
    liabilities: [{
      type: Schema.Types.Mixed
    }]
  },
  position: {
    type: Number,
    default: 0
  },
  fastTrackPosition: {
    type: Number,
    default: -1
  },
  isOnFastTrack: {
    type: Boolean,
    default: false
  },
  isReady: {
    type: Boolean,
    default: false
  },
  gameId: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'players'
});

// Pre-save middleware
PlayerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastActiveAt = new Date();
  next();
});

// Static methods
PlayerSchema.statics.findByPlayerId = function(playerId: string) {
  return this.findOne({ playerId });
};

PlayerSchema.statics.findByGameId = function(gameId: string) {
  return this.find({ gameId });
};

PlayerSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

// Instance methods
PlayerSchema.methods.updatePosition = function(newPosition: number) {
  this.position = newPosition;
  return this.save();
};

PlayerSchema.methods.moveToFastTrack = function(position: number = 0) {
  this.isOnFastTrack = true;
  this.fastTrackPosition = position;
  return this.save();
};

PlayerSchema.methods.addCash = function(amount: number) {
  this.finances.cash += amount;
  return this.save();
};

PlayerSchema.methods.removeCash = function(amount: number) {
  if (this.finances.cash < amount) {
    throw new Error('Insufficient funds');
  }
  this.finances.cash -= amount;
  return this.save();
};

PlayerSchema.methods.updateSalary = function(newSalary: number) {
  this.finances.salary = newSalary;
  return this.save();
};

PlayerSchema.methods.updatePassiveIncome = function(amount: number) {
  this.finances.passiveIncome += amount;
  return this.save();
};

PlayerSchema.methods.updateExpenses = function(amount: number) {
  this.finances.expenses += amount;
  return this.save();
};

PlayerSchema.methods.addAsset = function(asset: any) {
  this.finances.assets.push(asset);
  return this.save();
};

PlayerSchema.methods.addLiability = function(liability: any) {
  this.finances.liabilities.push(liability);
  return this.save();
};

PlayerSchema.methods.calculateCashFlow = function() {
  return this.finances.salary + this.finances.passiveIncome - this.finances.expenses;
};

PlayerSchema.methods.isFinanciallyFree = function() {
  return this.calculateCashFlow() > 0;
};

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);

// Add static methods to the model
(Player as any).findByPlayerId = function(playerId: string) {
  return this.findOne({ playerId });
};

(Player as any).findByGameId = function(gameId: string) {
  return this.find({ gameId });
};

(Player as any).findByEmail = function(email: string) {
  return this.findOne({ email });
};
export default Player;
