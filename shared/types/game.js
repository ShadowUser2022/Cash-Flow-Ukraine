"use strict";
// Спільні типи для гри Cashflow Online
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_CONFIG = exports.BOARD_CELLS = exports.PROFESSIONS = exports.GameState = void 0;
var GameState;
(function (GameState) {
    GameState["WAITING"] = "waiting";
    GameState["STARTING"] = "starting";
    GameState["IN_PROGRESS"] = "in_progress";
    GameState["PAUSED"] = "paused";
    GameState["FINISHED"] = "finished";
})(GameState || (exports.GameState = GameState = {}));
// Константи гри
exports.PROFESSIONS = [
    { name: 'Вчитель', salary: 3300, expenses: 2500 },
    { name: 'Медсестра', salary: 3100, expenses: 2300 },
    { name: 'Поліцейський', salary: 3000, expenses: 2200 },
    { name: 'Інженер', salary: 4900, expenses: 3900 },
    { name: 'Лікар', salary: 13200, expenses: 9650 },
    { name: 'Юрист', salary: 7500, expenses: 6100 }
];
exports.BOARD_CELLS = {
    RAT_RACE: 24,
    FAST_TRACK: 8
};
exports.GAME_CONFIG = {
    MAX_PLAYERS: 6,
    MIN_PLAYERS: 2,
    DEFAULT_TIME_LIMIT: 3600, // 1 година
    DICE_SIDES: 6,
    INITIAL_CASH: 400
};
//# sourceMappingURL=game.js.map