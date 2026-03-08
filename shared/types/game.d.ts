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
    playerId?: string;
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
export declare enum GameState {
    WAITING = "waiting",
    STARTING = "starting",
    IN_PROGRESS = "in_progress",
    PAUSED = "paused",
    FINISHED = "finished"
}
export interface GameSettings {
    maxPlayers: number;
    timeLimit: number;
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
    duration: number;
    isActive: boolean;
}
export interface MarketEffect {
    targetType: 'asset' | 'profession' | 'all';
    targetValue?: string;
    modifier: number;
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
    offerAssets?: string[];
    requestCash?: number;
    requestAssets?: string[];
    terms?: string;
    duration?: number;
    interestRate?: number;
}
export interface ServerToClientEvents {
    'game-state': (game: Game) => void;
    'player-joined': (data: {
        playerId: string;
        playerData: Player;
    }) => void;
    'player-left': (data: {
        playerId: string;
    }) => void;
    'dice-rolled': (data: {
        playerId: string;
        diceResult: number;
        newPosition: number;
        gameState: Game;
    }) => void;
    'deal-completed': (data: {
        playerId: string;
        dealId: string;
        result: any;
        gameState: Game;
    }) => void;
    'new-deals': (deals: Deal[]) => void;
    'cell-action': (action: any) => void;
    'negotiation-proposal': (data: {
        negotiationId: string;
        proposerId: string;
        proposal: NegotiationProposal;
    }) => void;
    'negotiation-response': (data: {
        negotiationId: string;
        response: string;
        result: any;
    }) => void;
    'market-event': (event: MarketEvent) => void;
    'error': (error: {
        message: string;
        code?: string;
    }) => void;
    'user-joined': (data: {
        peerId: string;
    }) => void;
    'user-left': (data: {
        peerId: string;
    }) => void;
    'offer': (data: {
        offer: RTCSessionDescriptionInit;
        from: string;
    }) => void;
    'answer': (data: {
        answer: RTCSessionDescriptionInit;
        from: string;
    }) => void;
    'ice-candidate': (data: {
        candidate: RTCIceCandidateInit;
        from: string;
    }) => void;
}
export interface ClientToServerEvents {
    'join-game': (data: {
        gameId: string;
        playerId: string;
    }) => void;
    'leave-game': (data: {
        gameId: string;
        playerId: string;
    }) => void;
    'roll-dice': (data: {
        gameId: string;
        playerId: string;
    }) => void;
    'make-deal': (data: {
        gameId: string;
        playerId: string;
        dealId: string;
    }) => void;
    'propose-negotiation': (data: {
        gameId: string;
        proposerId: string;
        targetId: string;
        proposal: NegotiationProposal;
    }) => void;
    'respond-negotiation': (data: {
        gameId: string;
        negotiationId: string;
        playerId: string;
        response: 'accept' | 'reject' | 'counter';
        counterProposal?: NegotiationProposal;
    }) => void;
    'ready-to-start': (data: {
        gameId: string;
        playerId: string;
    }) => void;
    'join-room': (data: {
        roomId: string;
        playerId: string;
    }) => void;
    'offer': (data: {
        offer: RTCSessionDescriptionInit;
        to: string;
    }) => void;
    'answer': (data: {
        answer: RTCSessionDescriptionInit;
        to: string;
    }) => void;
    'ice-candidate': (data: {
        candidate: RTCIceCandidateInit;
        to: string;
    }) => void;
}
export declare const PROFESSIONS: Profession[];
export declare const BOARD_CELLS: {
    RAT_RACE: number;
    FAST_TRACK: number;
};
export declare const GAME_CONFIG: {
    MAX_PLAYERS: number;
    MIN_PLAYERS: number;
    DEFAULT_TIME_LIMIT: number;
    DICE_SIDES: number;
    INITIAL_CASH: number;
};
//# sourceMappingURL=game.d.ts.map