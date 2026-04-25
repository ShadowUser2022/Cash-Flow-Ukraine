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

export type GameState = {
  id: string;
  player: {
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
  status: "ready" | "pending" | "won";
  turn: number;
  lastDice?: number;
  lastMove?: { from: number; to: number; track: Track };
  pendingAction?: PendingAction;
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
    throw new Error(payload.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/health"),
  meta: () =>
    request<{ dreams: Dream[]; board: { ratRace: CellType[]; fastTrack: CellType[] } }>(
      "/core/meta",
    ),
  newGame: (playerName: string, dreamId: string) =>
    request<GameState>("/core/new_game", {
      method: "POST",
      body: JSON.stringify({ playerName, dreamId }),
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
