// Константи для гри Cashflow Online

export const GAME_CONSTANTS = {
	// Налаштування гри
	MAX_PLAYERS: 6,
	MIN_PLAYERS: 2,
	DEFAULT_TIME_LIMIT: 3600, // 1 година
	DICE_SIDES: 6,
	INITIAL_CASH: 400,

	// Дошка
	RAT_RACE_CELLS: 24,
	FAST_TRACK_CELLS: 8,

	// WebRTC
	ICE_SERVERS: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' }
	],

	// Timeouts
	NEGOTIATION_TIMEOUT: 300000, // 5 хвилин
	TURN_TIMEOUT: 120000, // 2 хвилини

	// Мови
	SUPPORTED_LANGUAGES: ['uk', 'en'] as const
};

export const CELL_TYPES = {
	OPPORTUNITY: 'opportunity',
	MARKET: 'market',
	DOODAD: 'doodad',
	CHARITY: 'charity',
	DREAM: 'dream',
	CASHFLOW_DAY: 'cashflow_day',
	BUSINESS: 'business',
	LAWSUIT: 'lawsuit',
	DIVORCE: 'divorce',
	TAX_AUDIT: 'tax_audit'
} as const;

export const DEAL_TYPES = {
	SMALL: 'small',
	BIG: 'big',
	MARKET: 'market',
	DOODAD: 'doodad'
} as const;

export const ASSET_TYPES = {
	REAL_ESTATE: 'real_estate',
	BUSINESS: 'business',
	STOCKS: 'stocks',
	OTHER: 'other'
} as const;

export const LIABILITY_TYPES = {
	MORTGAGE: 'mortgage',
	LOAN: 'loan',
	CREDIT_CARD: 'credit_card',
	OTHER: 'other'
} as const;

export const SOCKET_EVENTS = {
	// Game events
	JOIN_GAME: 'join-game',
	LEAVE_GAME: 'leave-game',
	GAME_STATE: 'game-state',
	PLAYER_JOINED: 'player-joined',
	PLAYER_LEFT: 'player-left',
	PLAYER_DISCONNECTED: 'player-disconnected',
	PLAYER_RECONNECTED: 'player-reconnected',
	ROLL_DICE: 'roll-dice',
	DICE_ROLLED: 'dice-rolled',
	MAKE_DEAL: 'make-deal',
	DEAL_COMPLETED: 'deal-completed',
	NEW_DEALS: 'new-deals',
	CELL_ACTION: 'cell-action',
	PROPOSE_NEGOTIATION: 'propose-negotiation',
	NEGOTIATION_PROPOSAL: 'negotiation-proposal',
	RESPOND_NEGOTIATION: 'respond-negotiation',
	NEGOTIATION_RESPONSE: 'negotiation-response',
	MARKET_EVENT: 'market-event',
	READY_TO_START: 'ready-to-start',
	ERROR: 'error',

	// New game mechanics events
	EXECUTE_TURN: 'execute-turn',
	TURN_COMPLETED: 'turn-completed',
	BUY_DEAL: 'buy-deal',
	MOVE_TO_FAST_TRACK: 'move-to-fast-track',
	FAST_TRACK_MOVED: 'fast-track-moved',
	GENERATE_DEALS: 'generate-deals',

	// Card action events
	PAY_EXPENSE: 'pay-expense',
	EXPENSE_PAID: 'expense-paid',
	CHARITY_CHOICE: 'charity-choice',
	CHARITY_COMPLETED: 'charity-completed',
	MARKET_ACTION: 'market-action',
	MARKET_ACTION_COMPLETED: 'market-action-completed',
	CARD_ACTION_COMPLETED: 'card-action-completed',

	// Lobby events
	PLAYER_READY: 'player-ready',
	PLAYER_NOT_READY: 'player-not-ready',
	PROFESSION_SELECTED: 'profession-selected',
	GAME_STARTING: 'game-starting',
	GAME_STARTED: 'game-started',
	PLAYER_REMOVED: 'player-removed',

	// Chat events
	CHAT_MESSAGE: 'chat:message',
	CHAT_SEND_MESSAGE: 'chat:send-message',
	CHAT_TYPING: 'chat:typing',

	// WebRTC events
	JOIN_ROOM: 'join-room',
	USER_JOINED: 'user-joined',
	USER_LEFT: 'user-left',
	OFFER: 'offer',
	ANSWER: 'answer',
	ICE_CANDIDATE: 'ice-candidate'
} as const;
