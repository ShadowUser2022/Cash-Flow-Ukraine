// Socket events for frontend (local copy to avoid import issues)
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
	GAME_WON: 'game-won',

	// Card action events
	PAY_EXPENSE: 'pay-expense',
	EXPENSE_PAID: 'expense-paid',
	RECEIVE_INCOME: 'receive-income',
	INCOME_RECEIVED: 'income-received',
	COLLECT_SALARY: 'collect-salary',
	SALARY_COLLECTED: 'salary-collected',
	CHARITY_CHOICE: 'charity-choice',
	CHARITY_COMPLETED: 'charity-completed',
	MARKET_ACTION: 'market-action',
	MARKET_ACTION_COMPLETED: 'market-action-completed',
	CARD_ACTION_COMPLETED: 'card-action-completed',
	PLAYER_FINANCES_UPDATED: 'player-finances-updated',
	GET_PLAYER_FINANCES: 'get-player-finances',

	// Dream events
	SET_PLAYER_DREAM: 'set-player-dream',
	GET_PLAYER_DREAM: 'get-player-dream',
	PLAYER_DREAM_SET: 'player-dream-set',

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
	ICE_CANDIDATE: 'ice-candidate',

	// Phase 5 — turn timer
	TURN_TIMER_STARTED: 'turn-timer-started',
	TURN_TIMER_EXPIRED: 'turn-timer-expired',

	// Phase 4 — sell assets, market boom, special events
	SELL_DEAL: 'sell-deal',
	DEAL_SOLD: 'deal-sold',
	DIVORCE_APPLIED: 'divorce-applied',
	CASHFLOW_DAY_COLLECTED: 'cashflow-day-collected',
	MARKET_BOOM: 'market-boom'
} as const;
