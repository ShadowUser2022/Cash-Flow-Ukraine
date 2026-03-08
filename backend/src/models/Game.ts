import mongoose, { Schema, Document } from 'mongoose';
import { Game, GameState, Player, Deal, Negotiation, MarketEvent } from '../../../shared/types/game';

// Інтерфейс для MongoDB документа
export interface GameDocument extends Omit<Game, 'id'>, Document {
  _id: string;
}

const PlayerSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  profession: {
    name: { type: String, required: true },
    salary: { type: Number, required: true },
    expenses: { type: Number, required: true },
    description: String
  },
  position: { type: Number, default: 0 },
  fastTrackPosition: { type: Number, default: -1 },
  finances: {
    salary: { type: Number, default: 0 },
    passiveIncome: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    cash: { type: Number, default: 400 },
    assets: [Schema.Types.Mixed],
    liabilities: [Schema.Types.Mixed]
  },
  assets: [Schema.Types.Mixed],
  passiveIncome: { type: Number, default: 0 },
  isOnFastTrack: { type: Boolean, default: false },
  isReady: { type: Boolean, default: false },
  avatar: String
});

const DealSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['small', 'big', 'market', 'doodad'], required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  downPayment: Number,
  mortgage: Number,
  cashFlow: Number,
  requirements: [Schema.Types.Mixed],
  isAvailable: { type: Boolean, default: true },
  playerId: String
});

const NegotiationSchema = new Schema({
  id: { type: String, required: true },
  gameId: { type: String, required: true },
  proposerId: { type: String, required: true },
  targetId: { type: String, required: true },
  type: { type: String, enum: ['trade', 'partnership', 'loan', 'joint_investment'], required: true },
  proposal: Schema.Types.Mixed,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'counter_offered'], default: 'pending' },
  counterProposal: Schema.Types.Mixed,
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MarketEventSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['boom', 'crash', 'news', 'regulation'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  effects: [Schema.Types.Mixed],
  duration: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

const GameSchema = new Schema({
  id: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },
  players: [PlayerSchema],
  state: { 
    type: String, 
    enum: Object.values(GameState),
    default: GameState.WAITING 
  },
  currentPlayer: { type: String, default: '' },
  turn: { type: Number, default: 0 },
  settings: {
    maxPlayers: { type: Number, default: 6 },
    timeLimit: { type: Number, default: 3600 },
    language: { type: String, enum: ['uk', 'en'], default: 'uk' },
    allowSpectators: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['easy', 'normal', 'hard'], default: 'normal' }
  },
  board: {
    ratRaceCells: [Schema.Types.Mixed],
    fastTrackCells: [Schema.Types.Mixed]
  },
  deals: [DealSchema],
  marketEvents: [MarketEventSchema],
  negotiations: [NegotiationSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware для оновлення updatedAt
GameSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

GameSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Індекси для продуктивності
GameSchema.index({ id: 1 });
GameSchema.index({ hostId: 1 });
GameSchema.index({ state: 1 });
GameSchema.index({ 'players.id': 1 });

export const GameModel = mongoose.model<GameDocument>('Game', GameSchema);
