// Спільні типи для гри Cashflow Online

export interface Player {
	id: string;
	name: string;
	profession: Profession;
	position: number;
	fastTrackPosition: number;
	finances: PlayerFinances;
	assets: Asset[];
	passiveIncome: number;
	isOnFastTrack: boolean;
	isReady: boolean;
	isConnected: boolean;
	avatar?: string;
}

export interface Profession {
	name: string;
	salary: number;
	expenses: number;
	description?: string;
}

export interface PlayerFinances {
	salary: number;
	passiveIncome: number;
	expenses: number;
	cash: number;
	assets: Asset[];
	liabilities: Liability[];
}

export interface Asset {
	id: string;
	type: 'real_estate' | 'business' | 'stocks' | 'other';
	name: string;
	cost: number;
	cashFlow: number;
	downPayment?: number;
	mortgage?: number;
	description?: string;
}

export interface Liability {
	id: string;
	type: 'mortgage' | 'loan' | 'credit_card' | 'other';
	name: string;
	amount: number;
	monthlyPayment: number;
	description?: string;
}

export interface Deal {
	id: string;
	type: 'small' | 'big' | 'market' | 'doodad';
	category: string;
	title: string;
	description: string;
	cost: number;
	downPayment?: number;
	mortgage?: number;
	cashFlow?: number;
	requirements?: DealRequirement[];
	isAvailable: boolean;
	playerId?: string; // Якщо угода призначена конкретному гравцю
}

export interface DealRequirement {
	type: 'profession' | 'cash' | 'asset' | 'passive_income';
	value: any;
	description: string;
}

export interface Game {
	id: string;
	hostId: string;
	players: Player[];
	state: GameState;
	currentPlayer: string;
	turn: number;
	settings: GameSettings;
	board: GameBoard;
	deals: Deal[];
	marketEvents: MarketEvent[];
	negotiations: Negotiation[];
	createdAt: Date;
	updatedAt: Date;
}

export const GameState = {
	WAITING: 'waiting',
	STARTING: 'starting',
	IN_PROGRESS: 'in_progress',
	PAUSED: 'paused',
	FINISHED: 'finished'
} as const;

export type GameState = typeof GameState[keyof typeof GameState];

export interface GameSettings {
	maxPlayers: number;
	timeLimit: number; // в секундах
	language: 'uk' | 'en';
	allowSpectators: boolean;
	difficulty: 'easy' | 'normal' | 'hard';
}

export interface GameBoard {
	ratRaceCells: BoardCell[];
	fastTrackCells: BoardCell[];
}

export interface BoardCell {
	id: number;
	type: 'opportunity' | 'market' | 'doodad' | 'charity' | 'dream';
	title?: string;
	description?: string;
	action?: string;
}

export interface MarketEvent {
	id: string;
	type: 'boom' | 'crash' | 'news' | 'regulation';
	title: string;
	description: string;
	effects: MarketEffect[];
	duration: number; // в ходах
	isActive: boolean;
}

export interface MarketEffect {
	targetType: 'asset' | 'profession' | 'all';
	targetValue?: string;
	modifier: number; // множник або додаткове значення
	modifierType: 'multiply' | 'add' | 'subtract';
}

export interface Negotiation {
	id: string;
	gameId: string;
	proposerId: string;
	targetId: string;
	type: 'trade' | 'partnership' | 'loan' | 'joint_investment';
	proposal: NegotiationProposal;
	status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
	counterProposal?: NegotiationProposal;
	expiresAt: Date;
	createdAt: Date;
}

export interface NegotiationProposal {
	offerCash?: number;
	offerAssets?: string[]; // ID активів
	requestCash?: number;
	requestAssets?: string[]; // ID активів
	terms?: string; // Додаткові умови
	duration?: number; // Для партнерств
	interestRate?: number; // Для позик
}

// Додаткові типи для ігрової механіки

export interface GameTurn {
	playerId: string;
	turnNumber: number;
	diceRoll?: number;
	actions: TurnAction[];
	startedAt: Date;
	completedAt?: Date;
	isCompleted: boolean;
}

export interface TurnAction {
	id: string;
	type: 'move' | 'draw_card' | 'pay_expense' | 'collect_income' | 'buy_deal' | 'charity' | 'dream_action';
	data: any;
	timestamp: Date;
	result?: any;
}

export interface Card {
	id: string;
	type: 'opportunity' | 'market' | 'doodad';
	category: string;
	title: string;
	description: string;
	cost?: number;
	benefit?: number;
	cashFlow?: number;
	requirement?: CardRequirement;
	isActive: boolean;
}

export interface CardRequirement {
	type: 'profession' | 'cash_minimum' | 'asset_ownership' | 'passive_income_minimum';
	value: any;
	description: string;
}

export interface FinancialTransaction {
	id: string;
	playerId: string;
	type: 'income' | 'expense' | 'asset_purchase' | 'asset_sale' | 'loan' | 'investment';
	amount: number;
	description: string;
	recurring: boolean;
	timestamp: Date;
}

export interface GameAction {
	type: 'ROLL_DICE' | 'MOVE_PLAYER' | 'DRAW_CARD' | 'EXECUTE_CARD' | 'BUY_DEAL' | 'PAY_EXPENSES' | 'COLLECT_INCOME' | 'END_TURN';
	playerId: string;
	data?: any;
	timestamp: Date;
}

export interface CellEffect {
	type: 'draw_card' | 'pay_money' | 'receive_money' | 'choose_charity' | 'market_event' | 'dream_check';
	data?: any;
}

export interface ChatMessage {
	id: string;
	senderId: string;
	senderName: string;
	message: string;
	timestamp: Date;
	type: 'text' | 'system' | 'negotiation';
}

// Socket.io події
export interface ServerToClientEvents {
	'game-state': (game: Game) => void;
	'player-joined': (data: { playerId: string; playerData: Player }) => void;
	'player-left': (data: { playerId: string }) => void;
	'player-disconnected': (data: { playerId: string }) => void;
	'player-reconnected': (data: { playerId: string; player: Player }) => void;
	'dice-rolled': (data: { playerId: string; diceResult: number; newPosition: number; cellEffect?: any; gameState: Game }) => void;
	'deal-completed': (data: { playerId: string; dealId: string; result: any; gameState: Game }) => void;
	'new-deals': (deals: Deal[]) => void;
	'cell-action': (action: any) => void;
	'negotiation-proposal': (data: { negotiationId: string; proposerId: string; proposal: NegotiationProposal }) => void;
	'negotiation-response': (data: { negotiationId: string; response: string; result: any }) => void;
	'market-event': (event: MarketEvent) => void;
	'error': (error: { message: string; code?: string }) => void;

	// New game mechanics events
	'turn-completed': (data: { turn: any; nextPlayer: string; gameState: Game }) => void;
	'fast-track-moved': (data: { playerId: string; player: Player; gameState: Game }) => void;

	// Card action events
	'expense-paid': (data: { playerId: string; amount: number; gameState: Game }) => void;
	'charity-completed': (data: { playerId: string; choice: string; amount: number; gameState: Game }) => void;
	'market-action-completed': (data: { playerId: string; action: string; result: any; gameState: Game }) => void;
	'card-action-completed': (data: { playerId: string; action: string; gameState: Game }) => void;

	// Lobby events
	'player-ready': (data: { playerId: string; isReady: boolean }) => void;
	'player-not-ready': (data: { playerId: string; isReady: boolean }) => void;
	'profession-selected': (data: { playerId: string; profession: string; playerName: string }) => void;
	'game-starting': () => void;
	'game-started': (data: { gameState: Game }) => void;
	'player-removed': (data: { playerId: string; playerName: string }) => void;

	// Chat events
	'chat:message': (data: { message: ChatMessage }) => void;
	'chat:typing': (data: { userId: string; userName: string; isTyping: boolean }) => void;

	// WebRTC події
	'user-joined': (data: { peerId: string }) => void;
	'user-left': (data: { peerId: string }) => void;
	'offer': (data: { offer: RTCSessionDescriptionInit; from: string }) => void;
	'answer': (data: { answer: RTCSessionDescriptionInit; from: string }) => void;
	'ice-candidate': (data: { candidate: RTCIceCandidateInit; from: string }) => void;
}

export interface ClientToServerEvents {
	'join-game': (data: { gameId: string; playerId: string; playerName?: string }) => void;
	'leave-game': (data: { gameId: string; playerId: string }) => void;
	'roll-dice': (data: { gameId: string; playerId: string }) => void;
	'make-deal': (data: { gameId: string; playerId: string; dealId: string }) => void;
	'propose-negotiation': (data: { gameId: string; proposerId: string; targetId: string; proposal: NegotiationProposal }) => void;
	'respond-negotiation': (data: { gameId: string; negotiationId: string; playerId: string; response: 'accept' | 'reject' | 'counter'; counterProposal?: NegotiationProposal }) => void;
	'ready-to-start': (data: { gameId: string; playerId: string }) => void;

	// New game mechanics events
	'execute-turn': (data: { gameId: string; playerId: string }) => void;
	'buy-deal': (data: { gameId: string; playerId: string; dealId: string }) => void;
	'move-to-fast-track': (data: { gameId: string; playerId: string }) => void;
	'generate-deals': (data: { gameId: string; count?: number }) => void;

	// Card action events
	'pay-expense': (data: { gameId: string; playerId: string; amount: number }) => void;
	'charity-choice': (data: { gameId: string; playerId: string; choice: string; amount?: number }) => void;
	'market-action': (data: { gameId: string; playerId: string; action: string; data?: any }) => void;

	// Lobby events
	'player-ready': (data: { gameId: string; playerId: string; isReady: boolean }) => void;
	'profession-selected': (data: { gameId: string; playerId: string; profession: string }) => void;

	// Chat events
	'chat:send-message': (data: { roomId: string; playerId: string; playerName: string; message: string }) => void;
	'chat:typing': (data: { roomId: string; playerId: string; playerName: string; isTyping: boolean }) => void;

	// WebRTC події
	'join-room': (data: { roomId: string; playerId: string }) => void;
	'offer': (data: { offer: RTCSessionDescriptionInit; to: string }) => void;
	'answer': (data: { answer: RTCSessionDescriptionInit; to: string }) => void;
	'ice-candidate': (data: { candidate: RTCIceCandidateInit; to: string }) => void;
}

// Константи гри
export const PROFESSIONS: Profession[] = [
	{ name: 'Вчитель', salary: 3300, expenses: 2500 },
	{ name: 'Медсестра', salary: 3100, expenses: 2300 },
	{ name: 'Поліцейський', salary: 3000, expenses: 2200 },
	{ name: 'Інженер', salary: 4900, expenses: 3900 },
	{ name: 'Лікар', salary: 13200, expenses: 9650 },
	{ name: 'Юрист', salary: 7500, expenses: 6100 }
];

export const BOARD_CELLS = {
	RAT_RACE: 24,
	FAST_TRACK: 8
};

export const GAME_CONFIG = {
	MAX_PLAYERS: 6,
	MIN_PLAYERS: 2,
	DEFAULT_TIME_LIMIT: 3600, // 1 година
	DICE_SIDES: 6,
	INITIAL_CASH: 400
};
