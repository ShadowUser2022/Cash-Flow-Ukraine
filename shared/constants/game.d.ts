export declare const GAME_CONSTANTS: {
    MAX_PLAYERS: number;
    MIN_PLAYERS: number;
    DEFAULT_TIME_LIMIT: number;
    DICE_SIDES: number;
    INITIAL_CASH: number;
    RAT_RACE_CELLS: number;
    FAST_TRACK_CELLS: number;
    ICE_SERVERS: {
        urls: string;
    }[];
    NEGOTIATION_TIMEOUT: number;
    TURN_TIMEOUT: number;
    SUPPORTED_LANGUAGES: readonly ["uk", "en"];
};
export declare const CELL_TYPES: {
    readonly OPPORTUNITY: "opportunity";
    readonly MARKET: "market";
    readonly DOODAD: "doodad";
    readonly CHARITY: "charity";
    readonly DREAM: "dream";
};
export declare const DEAL_TYPES: {
    readonly SMALL: "small";
    readonly BIG: "big";
    readonly MARKET: "market";
    readonly DOODAD: "doodad";
};
export declare const ASSET_TYPES: {
    readonly REAL_ESTATE: "real_estate";
    readonly BUSINESS: "business";
    readonly STOCKS: "stocks";
    readonly OTHER: "other";
};
export declare const LIABILITY_TYPES: {
    readonly MORTGAGE: "mortgage";
    readonly LOAN: "loan";
    readonly CREDIT_CARD: "credit_card";
    readonly OTHER: "other";
};
export declare const SOCKET_EVENTS: {
    readonly JOIN_GAME: "join-game";
    readonly LEAVE_GAME: "leave-game";
    readonly GAME_STATE: "game-state";
    readonly PLAYER_JOINED: "player-joined";
    readonly PLAYER_LEFT: "player-left";
    readonly ROLL_DICE: "roll-dice";
    readonly DICE_ROLLED: "dice-rolled";
    readonly MAKE_DEAL: "make-deal";
    readonly DEAL_COMPLETED: "deal-completed";
    readonly NEW_DEALS: "new-deals";
    readonly CELL_ACTION: "cell-action";
    readonly PROPOSE_NEGOTIATION: "propose-negotiation";
    readonly NEGOTIATION_PROPOSAL: "negotiation-proposal";
    readonly RESPOND_NEGOTIATION: "respond-negotiation";
    readonly NEGOTIATION_RESPONSE: "negotiation-response";
    readonly MARKET_EVENT: "market-event";
    readonly READY_TO_START: "ready-to-start";
    readonly ERROR: "error";
    readonly JOIN_ROOM: "join-room";
    readonly USER_JOINED: "user-joined";
    readonly USER_LEFT: "user-left";
    readonly OFFER: "offer";
    readonly ANSWER: "answer";
    readonly ICE_CANDIDATE: "ice-candidate";
};
//# sourceMappingURL=game.d.ts.map