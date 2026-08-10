/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Career {
  id: string;
  name: string;
  nameEn: string;
  salary: number; // monthly salary (₴)
  taxes: number;
  rentOrMortgage: number;
  carPayment: number;
  childExpensePerChild: number;
  otherExpenses: number;
  initialCash: number;
  debts: {
    mortgage?: number;
    carLoan?: number;
    creditCard?: number;
    retailDebt?: number;
  };
}

export interface Player {
  id: string;
  name: string;
  career: Career;
  cash: number;
  passiveIncome: number;
  childrenCount: number;
  charityTurnsLeft: number; // if > 0, player can roll 2 dice
  layoffTurnsLeft: number; // if > 0, player skips turn
  currentPosition: number; // 0 to 23
  isFastTrack: boolean;
  color: string;
  ready: boolean;
  isBot?: boolean;
  country?: string;
  city?: string;
}

export type AssetType = 'REAL_ESTATE' | 'BUSINESS' | 'STOCK' | 'BOND';

export interface Asset {
  id: string;
  type: AssetType;
  name: string; // e.g. "Квартира на Позняках"
  symbol?: string; // for stocks (e.g., "MHP", "DTEK", "ОВДП")
  shares?: number; // for stocks
  cost: number;
  downPayment: number;
  mortgage?: number; // loan amount associated with this asset
  cashFlow: number; // monthly cash flow (can be negative for bad stock or high-mortgage property, but usually positive)
  dividend?: number; // dividend per share for stocks
  rangeOfValue?: string; // visual helper text
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  monthlyPayment: number;
}

export interface GameLog {
  id: string;
  timestamp: number;
  playerId?: string;
  playerName?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger' | 'dice' | 'ai';
}

export interface BoardSpace {
  index: number;
  type: 'PAYDAY' | 'OPPORTUNITY' | 'EXPENSE' | 'BABY' | 'LAYOFF' | 'CHARITY';
  name: string;
  description: string;
  icon: string;
}

export interface OpportunityCard {
  id: string;
  type: 'SMALL' | 'BIG';
  assetType: AssetType;
  name: string;
  description: string;
  cost: number;
  downPayment: number;
  mortgage?: number;
  cashFlow: number;
  symbol?: string;
  dividend?: number;
  yield?: number; // for bonds
}

export interface ExpenseCard {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface MarketCard {
  id: string;
  name: string;
  description: string;
  effectType: 'BUYER' | 'STOCK_SPLIT' | 'STOCK_CRASH' | 'INFLATION' | 'ECONOMIC_BOOM';
  assetType?: AssetType;
  symbol?: string;
  targetPrice?: number; // Price buyer is willing to pay or stock target price
  multiplier?: number; // For stock split/crash
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  isBot?: boolean;
  text: string;
  mediaType?: 'text' | 'audio' | 'video_clip' | 'system';
  audioUrl?: string;
  timestamp: number;
}

export interface GameState {
  roomId: string;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  players: Player[];
  playerAssets: Record<string, Asset[]>; // playerId -> Assets
  playerLiabilities: Record<string, Liability[]>; // playerId -> Liabilities
  currentTurnIndex: number;
  logs: GameLog[];
  activeCard: {
    type: 'OPPORTUNITY' | 'EXPENSE' | 'MARKET' | 'PAYDAY' | 'BABY' | 'LAYOFF' | 'CHARITY';
    card?: OpportunityCard | ExpenseCard | MarketCard | any;
    playerId: string;
    resolved: boolean;
  } | null;
  winnerId: string | null;
  aiAdvisorTips: Record<string, {
    blindSpots: string[];
    tips: string[];
    overallScore: number; // 0 - 100 financial health index
    advisorComment: string;
  }>; // playerId -> advice
  aiThinking: boolean;
}

export interface PublicRoomInfo {
  roomId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  createdAt?: number;
}

