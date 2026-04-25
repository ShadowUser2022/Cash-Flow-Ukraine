export type Track = "rat" | "fast";
export type CellType = "payday" | "deal" | "expense" | "dream";
export type PendingAction =
  | {
      type: "deal";
      title: string;
      amount: number;
      category: "business" | "real-estate";
      description: string;
      why: string;
    }
  | { type: "expense"; title: string; amount: number };

export type Dream = {
  id: string;
  title: string;
  cost: number;
};

export type Player = {
  id: string;
  name: string;
  cash: number;
  salary: number;
  expenses: number;
  passiveIncome: number;
  position: number;
  fastPosition: number;
  track: Track;
  dream: Dream;
};

export type GameState = {
  id: string;
  player: Player;
  status: "ready" | "pending" | "won";
  turn: number;
  lastDice?: number;
  lastMove?: { from: number; to: number; track: Track };
  pendingAction?: PendingAction;
  message: string;
  updatedAt: string;
};

export const dreams: Dream[] = [
  { id: "journey", title: "Подорож мрії", cost: 100000 },
  { id: "beach-house", title: "Будинок біля моря", cost: 300000 },
  { id: "time-freedom", title: "Свобода часу", cost: 150000 },
];

const ratRace: CellType[] = [
  "payday",
  "expense",
  "deal",
  "payday",
  "expense",
  "deal",
  "payday",
  "deal",
  "expense",
  "payday",
  "deal",
  "expense",
  "payday",
  "deal",
  "expense",
  "payday",
  "deal",
  "expense",
  "payday",
  "deal",
  "expense",
  "payday",
  "deal",
  "expense",
];

const fastTrack: CellType[] = [
  "dream",
  "payday",
  "deal",
  "payday",
  "expense",
  "dream",
  "deal",
  "payday",
  "dream",
  "expense",
  "deal",
  "payday",
  "dream",
  "deal",
  "payday",
  "dream",
];

export const board = { ratRace, fastTrack };

const dealOffers: Extract<PendingAction, { type: "deal" }>[] = [
  {
    type: "deal",
    title: "Міні-пекарня у Львові",
    amount: 500,
    category: "business",
    description: "Локальне виробництво випічки для кав'ярень. Дає стабільний пасивний дохід.",
    why: "Невеликий поріг входу, зрозумілий попит у районі та регулярні B2B-замовлення.",
  },
  {
    type: "deal",
    title: "Кавовий кіоск біля метро",
    amount: 450,
    category: "business",
    description: "Малий бізнес з ранковим потоком клієнтів. Потрібен оператор, але модель проста.",
    why: "Сильна локація важливіша за складну операційну модель. Добре для першого активу.",
  },
  {
    type: "deal",
    title: "Гараж під оренду",
    amount: 300,
    category: "real-estate",
    description: "Невелика нерухомість у спальному районі. Низький ризик, невеликий cashflow.",
    why: "Простий орендний актив без складного управління. Підходить для стабільності.",
  },
  {
    type: "deal",
    title: "Склад для інтернет-магазину",
    amount: 650,
    category: "real-estate",
    description: "Комерційне приміщення під оренду українському онлайн-бізнесу.",
    why: "Попит від малого e-commerce може дати вищий cashflow, але важлива заповненість.",
  },
];

export function createGame(playerName: string, dreamId: string): GameState {
  const dream = dreams.find((item) => item.id === dreamId) ?? dreams[0];
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    player: {
      id: crypto.randomUUID(),
      name: playerName.trim(),
      cash: 10000,
      salary: 2500,
      expenses: 2500,
      passiveIncome: 0,
      position: 0,
      fastPosition: 0,
      track: "rat",
      dream,
    },
    status: "ready",
    turn: 0,
    message: "Гра створена. Кинь кубик.",
    updatedAt: now,
  };
}

export function rollGame(game: GameState): GameState {
  if (game.status === "pending") {
    throw new Error("Спочатку заверши поточну подію.");
  }

  if (game.status === "won") {
    throw new Error("Гру вже завершено.");
  }

  const dice = Math.floor(Math.random() * 6) + 1;
  const player = { ...game.player };
  const originalTrack = player.track;
  const trackCells = player.track === "rat" ? ratRace : fastTrack;
  const current = player.track === "rat" ? player.position : player.fastPosition;
  const next = (current + dice) % trackCells.length;

  if (player.track === "rat") {
    player.position = next;
  } else {
    player.fastPosition = next;
  }

  player.cash += player.salary;

  const cell = trackCells[next];
  let pendingAction: PendingAction | undefined;
  let status: GameState["status"] = "ready";
  let message = `Кубик: ${dice}. Payday +$${player.salary.toLocaleString("en-US")}.`;

  if (player.track === "rat" && player.passiveIncome >= player.expenses) {
    player.track = "fast";
    player.fastPosition = 0;
    message = `${message} Passive >= expenses: перехід на Fast Track.`;
  } else if (cell === "deal") {
    pendingAction = dealOffers[(game.turn + next) % dealOffers.length];
    status = "pending";
    message = `Подія: ${pendingAction.title}. Прийми або пропусти.`;
  } else if (cell === "expense") {
    pendingAction = { type: "expense", title: "Несподівана витрата", amount: 350 };
    status = "pending";
    message = "Подія: витрата. Оплати або візьми в кредит.";
  } else if (cell === "dream") {
    if (player.cash + player.passiveIncome >= player.dream.cost) {
      status = "won";
      message = "Dream досягнуто. Ти переміг.";
    } else {
      message = "Dream клітинка: ще не вистачає cash + passiveIncome.";
    }
  }

  return touch({
    ...game,
    player,
    status,
    turn: game.turn + 1,
    lastDice: dice,
    lastMove: { from: current, to: next, track: originalTrack },
    pendingAction,
    message,
  });
}

export function resolvePending(game: GameState, accept: boolean): GameState {
  if (!game.pendingAction) {
    throw new Error("Немає pending події.");
  }

  const player = { ...game.player };
  const action = game.pendingAction;

  if (accept && action.type === "deal") {
    player.passiveIncome += action.amount;
  }

  if (accept && action.type === "expense") {
    player.cash -= action.amount;
  }

  return touch({
    ...game,
    player,
    status: "ready",
    pendingAction: undefined,
    message: accept ? `${action.title}: прийнято.` : `${action.title}: пропущено.`,
  });
}

function touch(game: GameState): GameState {
  return { ...game, updatedAt: new Date().toISOString() };
}
