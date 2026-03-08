"use strict";
// Константи для гри Cashflow Online
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.LIABILITY_TYPES = exports.ASSET_TYPES = exports.DEAL_TYPES = exports.CELL_TYPES = exports.GAME_CONSTANTS = void 0;
exports.GAME_CONSTANTS = {
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
    SUPPORTED_LANGUAGES: ['uk', 'en']
};
exports.CELL_TYPES = {
    OPPORTUNITY: 'opportunity',
    MARKET: 'market',
    DOODAD: 'doodad',
    CHARITY: 'charity',
    DREAM: 'dream'
};
exports.DEAL_TYPES = {
    SMALL: 'small',
    BIG: 'big',
    MARKET: 'market',
    DOODAD: 'doodad'
};
exports.ASSET_TYPES = {
    REAL_ESTATE: 'real_estate',
    BUSINESS: 'business',
    STOCKS: 'stocks',
    OTHER: 'other'
};
exports.LIABILITY_TYPES = {
    MORTGAGE: 'mortgage',
    LOAN: 'loan',
    CREDIT_CARD: 'credit_card',
    OTHER: 'other'
};
exports.SOCKET_EVENTS = {
    // Game events
    JOIN_GAME: 'join-game',
    LEAVE_GAME: 'leave-game',
    GAME_STATE: 'game-state',
    PLAYER_JOINED: 'player-joined',
    PLAYER_LEFT: 'player-left',
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
    // WebRTC events
    JOIN_ROOM: 'join-room',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    OFFER: 'offer',
    ANSWER: 'answer',
    ICE_CANDIDATE: 'ice-candidate'
};
//# sourceMappingURL=game.js.map