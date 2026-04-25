export type Track = "rat" | "fast";
export type CellType = "payday" | "deal" | "expense" | "dream";
export type PendingAction =
  | {
      type: "deal";
      title: string;
      price: number;
      income: number;
      expenses: number;
      category: "business" | "real-estate";
      description: string;
      hint: string;
    }
  | { type: "expense"; title: string; amount: number; creditPayment: number; description: string; scale: "small" | "big" }
  | { type: "freelance"; title: string; amount: number; cashBefore: number; cashAfter: number }
  | {
      type: "salary";
      title: string;
      salary: number;
      passiveIncome: number;
      expenses: number;
      net: number;
      debtPayment: number;
      bankDebtBefore: number;
      bankDebtAfter: number;
      cashBefore: number;
      cashAfter: number;
    }
  | { type: "level-up"; title: string; description: string };

export type Dream = {
  id: string;
  title: string;
  cost: number;
};

export type StartProfile = {
  id: string;
  title: string;
  description: string;
  cash: number;
  salary: number;
  expenses: number;
};

export type ExpensesBreakdown = {
  rent: number;
  kids: number;
  bankInterest: number;
  food: number;
  utilities: number;
  fun: number;
};

export type Player = {
  id: string;
  name: string;
  cash: number;
  salary: number;
  expenses: number;
  expensesBreakdown: ExpensesBreakdown;
  passiveIncome: number;
  bankDebt: number;
  position: number;
  fastPosition: number;
  track: Track;
  dream: Dream;
  profile: StartProfile;
};

export type GameState = {
  id: string;
  player: Player;
  status: "ready" | "pending" | "won" | "bankrupt";
  turn: number;
  lastFreelanceTurn: number;
  lastSalaryTurn: number;
  lastInheritanceTurn: number;
  lastDice?: number;
  lastMove?: { from: number; to: number; track: Track };
  pendingAction?: PendingAction;
  /** Used to chain a major expense right after a salary event every N turns. */
  chainedAction?: PendingAction;
  message: string;
  updatedAt: string;
};

export const dreams: Dream[] = [
  { id: "journey", title: "Подорож мрії", cost: 500000 },
  { id: "beach-house", title: "Будинок біля моря", cost: 1500000 },
  { id: "time-freedom", title: "Свобода часу", cost: 750000 },
];

export const startProfiles: StartProfile[] = [
  {
    id: "janitor",
    title: "Двірник",
    description: "Невелика зарплата і дуже обмежений запас готівки. Кожна витрата відчутна.",
    cash: 2000,
    salary: 50000,
    expenses: 48000,
  },
  {
    id: "policewoman",
    title: "Поліцейська",
    description: "Стабільна зарплата, але регулярні сімейні та побутові витрати майже все забирають.",
    cash: 5000,
    salary: 70000,
    expenses: 68000,
  },
  {
    id: "manager",
    title: "Менеджер",
    description: "Вищий дохід, але дорогий стиль життя залишає мало вільних грошей.",
    cash: 10000,
    salary: 100000,
    expenses: 97000,
  },
];

const ratRace: CellType[] = [
  // More life expenses, fewer paydays.
  "expense",
  "payday",
  "expense",
  "deal",
  "expense",
  "expense",
  "deal",
  "expense",
  "payday",
  "expense",
  "deal",
  "expense",
  "expense",
  "deal",
  "expense",
  "payday",
  "expense",
  "deal",
  "expense",
  "expense",
  "deal",
  "expense",
  "payday",
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
    price: 12000,
    income: 7000,
    expenses: 2500,
    category: "business",
    description: "Локальне виробництво випічки для кав'ярень.",
    hint: "Підказка: дохід мінус витрати дає приблизний місячний результат.",
  },
  {
    type: "deal",
    title: "Кавовий кіоск біля метро",
    price: 18000,
    income: 9500,
    expenses: 4200,
    category: "business",
    description: "Малий бізнес з ранковим потоком клієнтів.",
    hint: "Порахуй чистий потік: скільки лишиться після щомісячних витрат.",
  },
  {
    type: "deal",
    title: "Гараж під оренду",
    price: 9000,
    income: 3500,
    expenses: 900,
    category: "real-estate",
    description: "Невелика нерухомість у спальному районі.",
    hint: "Оренда менша, але й витрати на утримання нижчі.",
  },
  {
    type: "deal",
    title: "Склад для інтернет-магазину",
    price: 26000,
    income: 13000,
    expenses: 5800,
    category: "real-estate",
    description: "Комерційне приміщення під оренду українському онлайн-бізнесу.",
    hint: "Велика угода може дати більше, але часто потребує кредиту в банку.",
  },
];

const smallExpenseOffers: Extract<PendingAction, { type: "expense" }>[] = [
  {
    type: "expense",
    title: "Кава та перекуси",
    amount: 1200,
    creditPayment: 80,
    description: "Регулярні дрібні витрати на кожен день.",
    scale: "small",
  },
  {
    type: "expense",
    title: "Поїздка на таксі",
    amount: 900,
    creditPayment: 60,
    description: "Терміновий виклик, коли не встигаєш на громадський транспорт.",
    scale: "small",
  },
  {
    type: "expense",
    title: "Побутова дрібниця",
    amount: 1500,
    creditPayment: 90,
    description: "Раптові покупки додому, без чого важко крутитися далі.",
    scale: "small",
  },
  {
    type: "expense",
    title: "Подарунок близькому",
    amount: 1800,
    creditPayment: 100,
    description: "Невелика, але важлива витрата з приводу сім'ї/друга.",
    scale: "small",
  },
];

const bigExpenseOffers: Extract<PendingAction, { type: "expense" }>[] = [
  {
    type: "expense",
    title: "Вкрали телефон в автобусі",
    amount: 3200,
    creditPayment: 200,
    description: "Потрібен новий телефон для роботи і спілкування.",
    scale: "big",
  },
  {
    type: "expense",
    title: "Весілля друзів",
    amount: 2500,
    creditPayment: 180,
    description: "Подарунок, невеликий внесок і супутні витрати.",
    scale: "big",
  },
  {
    type: "expense",
    title: "Сімейна подія",
    amount: 3600,
    creditPayment: 220,
    description: "Важлива велика витрата, яка не планується кожен місяць.",
    scale: "big",
  },
  {
    type: "expense",
    title: "Ремонт техніки",
    amount: 2400,
    creditPayment: 160,
    description: "Поламалась техніка, яка потрібна для роботи.",
    scale: "big",
  },
  {
    type: "expense",
    title: "Непередбачена медицина",
    amount: 3000,
    creditPayment: 200,
    description: "Терміновий візит до лікаря чи курс лікування.",
    scale: "big",
  },
];

const salaryEveryTurns = 10;
// Big mandatory bills should feel rare: every 20 turns, chained after a salary "checkpoint".
const bigLifeExpenseEveryTurns = 20;
const inheritanceCooldownTurns = 50;
const bankPaymentRate = 0.1;
const bankDebtLimit = 50000;
const debtPaymentRateOnSalaryDay = 0.1;

const freelanceTitles = ["Підробіток", "Фріланс"] as const;
const inheritanceTitle = "Спадок" as const;

function sumExpenses(breakdown: ExpensesBreakdown) {
  return (
    breakdown.rent +
    breakdown.kids +
    breakdown.bankInterest +
    breakdown.food +
    breakdown.utilities +
    breakdown.fun
  );
}

function normalizeExpensesBreakdown(total: number): ExpensesBreakdown {
  // Initial split of profile.expenses. kids/bankInterest start at 0.
  const safeTotal = Math.max(0, Math.floor(total));
  const rent = Math.floor(safeTotal * 0.35);
  const food = Math.floor(safeTotal * 0.25);
  const utilities = Math.floor(safeTotal * 0.15);
  const fun = Math.max(0, safeTotal - rent - food - utilities);
  return { rent, kids: 0, bankInterest: 0, food, utilities, fun };
}

function withRecalculatedExpenses(player: Player): Player {
  return { ...player, expenses: sumExpenses(player.expensesBreakdown) };
}

export function createGame(playerName: string, dreamId: string, profileId = startProfiles[0].id): GameState {
  const dream = dreams.find((item) => item.id === dreamId) ?? dreams[0];
  const profile = startProfiles.find((item) => item.id === profileId) ?? startProfiles[0];
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    player: {
      id: crypto.randomUUID(),
      name: playerName.trim(),
      cash: profile.cash,
      salary: profile.salary,
      expenses: profile.expenses,
      expensesBreakdown: normalizeExpensesBreakdown(profile.expenses),
      passiveIncome: 0,
      bankDebt: 0,
      position: 0,
      fastPosition: 0,
      track: "rat",
      dream,
      profile,
    },
    status: "ready",
    turn: 0,
    lastFreelanceTurn: 0,
    lastSalaryTurn: 0,
    lastInheritanceTurn: 0,
    chainedAction: undefined,
    message: "Гра створена. Збери перші 10 000 грн готівки.",
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

  if (game.status === "bankrupt") {
    throw new Error("Гру завершено банкрутством.");
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

  const cell = trackCells[next];
  let pendingAction: PendingAction | undefined;
  let status: GameState["status"] = "ready";
  let message = `Кубик: ${dice}.`;
  const turn = game.turn + 1;
  let chainedAction: PendingAction | undefined;

  // Підробіток: кожного разу на клітинці "payday" (фріланс/подарунок/спадок).
  if (cell === "payday") {
    const cashBefore = player.cash;
    // Freelance should feel small vs salary.
    const base = Math.floor(player.salary / 40);
    const min = Math.max(0, Math.floor(base * 0.85));
    const max = Math.max(min, Math.floor(base * 1.15));

    const canInheritance = turn - game.lastInheritanceTurn >= inheritanceCooldownTurns;
    const inheritanceRoll = Math.random() < 0.12;

    const isInheritance = canInheritance && inheritanceRoll;
    const amount = isInheritance
      ? randomInt(Math.max(0, player.salary * 2), Math.max(0, player.salary * 5))
      : randomInt(min, max);

    player.cash += amount;
    pendingAction = {
      type: "freelance",
      title: isInheritance ? inheritanceTitle : freelanceTitles[(turn + next) % freelanceTitles.length],
      amount,
      cashBefore,
      cashAfter: player.cash,
    };
    status = "pending";
    message = "Ви отримали гроші. Підтвердіть, що побачили нарахування.";
  }

  // Зарплата: окрема подія раз на 10 ходів (з підтвердженням).
  const canSalary = status === "ready" && turn - game.lastSalaryTurn >= salaryEveryTurns;
  if (canSalary) {
    const cashBefore = player.cash;
    const net = player.salary + player.passiveIncome - player.expenses;
    const bankDebtBefore = player.bankDebt;
    const maxDebtPayment = Math.max(0, Math.floor(player.salary * debtPaymentRateOnSalaryDay));
    const debtPayment = Math.min(bankDebtBefore, maxDebtPayment);
    player.cash += net - debtPayment;
    player.bankDebt = Math.max(0, player.bankDebt - debtPayment);
    pendingAction = {
      type: "salary",
      title: "День зарплати",
      salary: player.salary,
      passiveIncome: player.passiveIncome,
      expenses: player.expenses,
      net,
      debtPayment,
      bankDebtBefore,
      bankDebtAfter: player.bankDebt,
      cashBefore,
      cashAfter: player.cash,
    };

    const bankruptAfterSalary = player.cash < 0;
    if (!bankruptAfterSalary && turn > 0 && turn % bigLifeExpenseEveryTurns === 0) {
      chainedAction = pickExpenseOffer(turn, next, "big", bigExpenseOffers);
    }

    status = bankruptAfterSalary ? "bankrupt" : "pending";
    message = bankruptAfterSalary
      ? "День зарплати: нарахування не покрило витрати та/або борг. Банкрутство."
      : "День зарплати: нарахування + автоматичне погашення боргу. Підтвердіть розрахунок.";
  }

  if (status === "ready" && player.track === "rat" && player.passiveIncome > player.expenses) {
    pendingAction = {
      type: "level-up",
      title: "Ви вийшли на 2-й рівень",
      description: "Пасивний дохід став вищим за витрати. Тепер ваша ціль — досягти мрії.",
    };
    status = "pending";
    message = "Пасивний дохід вищий за витрати. Підтвердіть перехід на швидкісну доріжку.";
  } else if (status === "ready" && cell === "deal") {
    pendingAction = dealOffers[(game.turn + next) % dealOffers.length];
    status = "pending";
    message = `Подія: ${pendingAction.title}. Прийми або пропусти.`;
  } else if (status === "ready" && cell === "expense") {
    pendingAction = pickExpenseOffer(game.turn, next, "small", smallExpenseOffers);
    status = "pending";
    message = "Подія: витрата. Оплати або візьми в кредит.";
  } else if (status === "ready" && cell === "dream") {
    if (player.cash + player.passiveIncome >= player.dream.cost) {
      status = "won";
      message = "Мрію досягнуто. Ти переміг.";
    } else {
      message = "Клітинка мрії: ще не вистачає готівки та пасивного доходу.";
    }
  }

  return touch({
    ...game,
    player,
    status,
    turn,
    lastFreelanceTurn: cell === "payday" ? turn : game.lastFreelanceTurn,
    lastSalaryTurn: canSalary ? turn : game.lastSalaryTurn,
    lastInheritanceTurn: cell === "payday" && pendingAction?.type === "freelance" && pendingAction.title === inheritanceTitle ? turn : game.lastInheritanceTurn,
    lastDice: dice,
    lastMove: { from: current, to: next, track: originalTrack },
    pendingAction,
    chainedAction,
    message,
  });
}

export function resolvePending(game: GameState, accept: boolean): GameState {
  if (!game.pendingAction) {
    throw new Error("Немає pending події.");
  }

  let player = { ...game.player };
  const action = game.pendingAction;

  if (accept && action.type === "deal") {
    const shortage = Math.max(0, action.price - player.cash);
    const bankPayment = calculateBankPayment(shortage);
    if (player.bankDebt + shortage > bankDebtLimit) {
      throw new Error(`Ліміт банку ${formatMoney(bankDebtLimit)}. Візьми меншу угоду або погаси борг.`);
    }
    player.cash = Math.max(0, player.cash - action.price);
    player.bankDebt += shortage;
    player.passiveIncome += action.income;
    player.expensesBreakdown.utilities += action.expenses;
    player.expensesBreakdown.bankInterest += bankPayment;
    player = withRecalculatedExpenses(player);
  }

  if (accept && action.type === "expense") {
    player.cash -= action.amount;
  }

  if (!accept && action.type === "expense") {
    if (player.bankDebt + action.amount > bankDebtLimit) {
      throw new Error(`Ліміт банку ${formatMoney(bankDebtLimit)}. В кредит більше не можна — буде банкрутство.`);
    }
    player.bankDebt += action.amount;
    player.expensesBreakdown.bankInterest += action.creditPayment;
    player = withRecalculatedExpenses(player);
  }

  if (accept && action.type === "level-up") {
    player.track = "fast";
    player.fastPosition = 0;
  }

  // Chain salary -> big life expense (or clear chain if not applicable).
  let nextPending: PendingAction | undefined;
  let chained: PendingAction | undefined;
  if (action.type === "salary" && game.chainedAction) {
    nextPending = game.chainedAction;
    chained = undefined;
  } else {
    nextPending = undefined;
    chained = action.type === "salary" ? undefined : game.chainedAction;
  }

  const bankruptcy = player.cash < 0;

  return touch({
    ...game,
    player,
    status: bankruptcy ? "bankrupt" : nextPending ? "pending" : "ready",
    pendingAction: nextPending,
    chainedAction: bankruptcy ? undefined : chained,
    message: bankruptcy
      ? "Готівка пішла в мінус. Банкрутство."
      : nextPending
        ? "Наступна подія: велика витрата. Оплати або візьми в кредит."
        : resolveMessage(action, accept),
  });
}

function resolveMessage(action: PendingAction, accept: boolean) {
  if (action.type === "salary") {
    return "Нарахування підтверджено. Продовжуйте хід.";
  }

  if (action.type === "freelance") {
    return "Підробіток підтверджено. Продовжуйте хід.";
  }

  if (action.type === "level-up") {
    return "Ви перейшли на швидкісну доріжку. Тепер рухайтесь до мрії.";
  }

  if (action.type === "expense") {
    return accept
      ? `${action.title}: оплачено.`
      : `${action.title}: кредит додав ${formatMoney(action.creditPayment)} до щомісячних витрат.`;
  }

  return accept ? `${action.title}: прийнято.` : `${action.title}: пропущено.`;
}

function calculateBankPayment(shortage: number) {
  return Math.ceil(shortage * bankPaymentRate);
}

function formatMoney(value: number) {
  return `${value.toLocaleString("uk-UA")} грн`;
}

function randomInt(min: number, max: number) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function pickExpenseOffer(
  turn: number,
  cell: number,
  scale: "small" | "big",
  list: Extract<PendingAction, { type: "expense" }>[],
): Extract<PendingAction, { type: "expense" }> {
  const salt = scale === "small" ? 0 : 1;
  return list[(turn * 13 + cell * 7 + salt) % list.length];
}

function touch(game: GameState): GameState {
  return { ...game, updatedAt: new Date().toISOString() };
}
