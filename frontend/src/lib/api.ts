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

export type GameState = {
  id: string;
  player: {
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
  status: "ready" | "pending" | "won" | "bankrupt";
  turn: number;
  lastFreelanceTurn: number;
  lastSalaryTurn: number;
  lastInheritanceTurn: number;
  lastDice?: number;
  lastMove?: { from: number; to: number; track: Track };
  pendingAction?: PendingAction;
  chainedAction?: PendingAction;
  message: string;
  updatedAt: string;
};

export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? `Запит не виконано: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/health"),
  meta: () =>
    request<{ dreams: Dream[]; profiles: StartProfile[]; board: { ratRace: CellType[]; fastTrack: CellType[] } }>(
      "/core/meta",
    ),
  newGame: (playerName: string, dreamId: string, profileId: string) =>
    request<GameState>("/core/new_game", {
      method: "POST",
      body: JSON.stringify({ playerName, dreamId, profileId }),
    }),
  state: (gameId: string) => request<GameState>(`/core/state/${gameId}`),
  roll: (gameId: string) =>
    request<GameState>("/core/roll", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    }),
  resolvePending: (gameId: string, accept: boolean) =>
    request<GameState>("/core/resolve_pending", {
      method: "POST",
      body: JSON.stringify({ gameId, accept }),
    }),
};
