import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { api, API_URL, type CellType, type Dream, type GameState } from "./lib/api";

const sessionKey = "cash-flow-clean-session";
const visibleCellCount = 5;

function App() {
  const [playerName, setPlayerName] = useState("");
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [selectedDream, setSelectedDream] = useState("");
  const [ratRace, setRatRace] = useState<CellType[]>([]);
  const [fastTrack, setFastTrack] = useState<CellType[]>([]);
  const [game, setGame] = useState<GameState | null>(null);
  const [connection, setConnection] = useState<"checking" | "ok" | "error">("checking");
  const [lastError, setLastError] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [rollState, setRollState] = useState<"idle" | "rolling" | "revealed" | "moving">("idle");
  const [revealedDice, setRevealedDice] = useState<number | null>(null);

  useEffect(() => {
    void bootstrap();
  }, []);

  const board = game?.player.track === "fast" ? fastTrack : ratRace;
  const position = game?.player.track === "fast" ? game.player.fastPosition : game?.player.position;
  const visibleBoard = useMemo(
    () => getVisibleCells(board, position ?? 0, visibleCellCount),
    [board, position],
  );
  const canRoll = game?.status === "ready" && rollState === "idle";
  const turnPhase = game ? getTurnPhase(game) : "dice";
  const fastTrackProgress = game
    ? Math.min(100, Math.round((game.player.passiveIncome / game.player.expenses) * 100))
    : 0;
  async function bootstrap() {
    try {
      await api.health();
      setConnection("ok");

      const meta = await api.meta();
      setDreams(meta.dreams);
      setSelectedDream((current) => current || meta.dreams[0]?.id || "");
      setRatRace(meta.board.ratRace);
      setFastTrack(meta.board.fastTrack);

      const savedGameId = localStorage.getItem(sessionKey);
      if (savedGameId) {
        try {
          const restored = await api.state(savedGameId);
          setGame(restored);
        } catch {
          localStorage.removeItem(sessionKey);
          setLastError("Попередню сесію не знайдено. Можна почати нову гру.");
        }
      }
    } catch (error) {
      setConnection("error");
      setLastError(error instanceof Error ? error.message : "Connection failed");
    }
  }

  async function run(action: () => Promise<GameState>) {
    setLastError("");
    try {
      const next = await action();
      localStorage.setItem(sessionKey, next.id);
      setGame(next);
      setConnection("ok");
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Action failed");
      setConnection("error");
    }
  }

  async function startGame() {
    await run(() => api.newGame(playerName, selectedDream));
  }

  async function rollDice() {
    if (!game || !canRoll) return;

    setLastError("");
    setRevealedDice(null);
    setRollState("rolling");

    try {
      const next = await api.roll(game.id);
      setConnection("ok");
      await wait(450);
      setRevealedDice(next.lastDice ?? null);
      setRollState("revealed");
      await wait(650);
      setRollState("moving");
      setGame(next);
      localStorage.setItem(sessionKey, next.id);
      await wait(420);
      setRollState("idle");
      setRevealedDice(null);
    } catch (error) {
      setLastError(error instanceof Error ? error.message : "Action failed");
      setConnection("error");
      setRollState("idle");
      setRevealedDice(null);
    }
  }

  function exitGame() {
    localStorage.removeItem(sessionKey);
    setGame(null);
    setLastError("");
  }

  return (
    <main className="app-shell">
      {game && (
        <button className="ghost top-left" onClick={exitGame}>
          ← До лобі
        </button>
      )}

      <header className={`top-bar ${connection}`}>
        <div className="brand">
          <strong>Cash Flow Ukraine</strong>
          <span>{game ? "Core Solo (v0)" : "Core v0"}</span>
          <small>{game ? "24 клітинки · прості події" : "1 гравець · 24 клітинки · 3 події"}</small>
        </div>
        <div className="server-chip">
          <strong>{connection === "ok" ? "OK" : connection === "checking" ? "Sync" : "Error"}</strong>
          <span>{connection === "ok" ? API_URL : lastError || "Перевірка API..."}</span>
          <button className="icon-button" onClick={() => setDebugOpen(true)} aria-label="Debug">
            i
          </button>
        </div>
      </header>

      {game && (
        <section className="status-rail" aria-label="Стан гри">
          <strong>{game.player.name}</strong>
          <span>{game.player.track === "fast" ? "Fast Track" : "Rat Race"}</span>
          <span>📍 {position}</span>
          <span>Хід {game.turn}</span>
          <span>🎲 {revealedDice ?? game.lastDice ?? "-"}</span>
        </section>
      )}

      {!game ? (
        <section className="panel lobby">
          <label>
            Ваше ім'я
            <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Введіть ваше ім'я..." />
          </label>

          <div className="dreams">
            <h2>Обери мрію</h2>
            {dreams.map((dream) => (
              <label key={dream.id} className="dream-card">
                <input
                  type="radio"
                  checked={selectedDream === dream.id}
                  onChange={() => setSelectedDream(dream.id)}
                />
                <span>
                  <strong>{dream.title}</strong>
                  <small>${dream.cost.toLocaleString("en-US")}</small>
                </span>
              </label>
            ))}
          </div>

          <button className="primary" disabled={!playerName.trim() || connection !== "ok"} onClick={startGame}>
            Почати Core Solo (v0)
          </button>

          <details>
            <summary>Як працює core</summary>
            <p>Кидаєш кубик, рухаєш фішку, отримуєш payday і вирішуєш подію клітинки.</p>
          </details>
        </section>
      ) : (
        <section className="game-grid">
          <div className="panel event-panel">
            <div className="guide-copy">
              <div className="guide-title-line">
                <h2>{guideTitle(game)}</h2>
                {game.pendingAction ? (
                  <strong className={`amount-badge ${game.pendingAction.type}`}>
                    {game.pendingAction.type === "deal" ? "+" : "-"}$
                    {game.pendingAction.amount.toLocaleString("en-US")}
                  </strong>
                ) : (
                  <>
                    <span>•</span>
                    <small>{guideSummary(game)}</small>
                  </>
                )}
              </div>
              <div className="turn-timeline" aria-label="Етапи ходу">
                {turnSteps.map((step) => (
                  <span
                    key={step.id}
                    className={`turn-step ${step.id === turnPhase ? "active" : ""} ${
                      isStepComplete(step.id, turnPhase) ? "complete" : ""
                    }`}
                  >
                    {step.label}
                  </span>
                ))}
              </div>
              <p>{guideHint(game)}</p>
            </div>
            <div className="guide-action">
              {game.status === "won" ? (
                <button className="primary" onClick={exitGame}>
                  До лобі
                </button>
              ) : game.pendingAction ? (
                <div className="action-cluster">
                  <div className="action-context">
                    <span>{actionKindLabel(game.pendingAction)}</span>
                    <strong>{game.pendingAction.title}</strong>
                    <em>
                      {game.pendingAction.type === "deal" ? "+" : "-"}$
                      {game.pendingAction.amount.toLocaleString("en-US")}
                    </em>
                    {game.pendingAction.type === "deal" && (
                      <div className="deal-details">
                        <p>{game.pendingAction.description}</p>
                        <small>{game.pendingAction.why}</small>
                      </div>
                    )}
                  </div>
                  <div className="action-row">
                    <button className="primary" onClick={() => run(() => api.resolvePending(game.id, true))}>
                      {game.pendingAction.type === "deal" ? "Прийняти" : "Оплатити"}
                    </button>
                    <button onClick={() => run(() => api.resolvePending(game.id, false))}>
                      {game.pendingAction.type === "deal" ? "Пропустити" : "В кредит"}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="primary" disabled={!canRoll} onClick={rollDice}>
                  {rollState === "rolling"
                    ? "Кубик..."
                    : rollState === "revealed"
                      ? `Випало ${revealedDice}`
                      : rollState === "moving"
                        ? "Рухаємось..."
                        : "Кинути кубик"}
                </button>
              )}
            </div>
          </div>

          <div className="finance-strip" aria-label="Фінанси">
            <FinanceChip label="Cash" value={`$${game.player.cash.toLocaleString("en-US")}`} />
            <FinanceChip label="Passive" value={`$${game.player.passiveIncome.toLocaleString("en-US")}`} />
            <FinanceChip label="Expenses" value={`$${game.player.expenses.toLocaleString("en-US")}`} />
            <FinanceChip label="Dream" value={`$${game.player.dream.cost.toLocaleString("en-US")}`} />
            <div className="fast-track-chip">
              <div>
                <span>Fast Track</span>
                <strong>
                  ${game.player.passiveIncome.toLocaleString("en-US")} / ${game.player.expenses.toLocaleString("en-US")}
                </strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${fastTrackProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="panel board">
            <div className="board-header">
              <h2>{game.player.track === "fast" ? "Fast Track" : "Rat Race"}</h2>
              <span>вікно дошки · позиція: {position}</span>
            </div>
            <div className="board-window">
              <span className="edge-hint left">ще</span>
              <div className={`cells ${rollState === "moving" ? "slide-left" : ""}`}>
                {visibleBoard.map(({ cell, index }) => (
                  <div key={`${cell}-${index}`} className={`cell ${cell} ${index === position ? "active" : ""}`}>
                    <span>{cell.toUpperCase()}</span>
                    {index === position && <strong>YOU</strong>}
                  </div>
                ))}
              </div>
              <span className="edge-hint right">далі</span>
            </div>
          </div>

        </section>
      )}

      {debugOpen && (
        <div className="modal-backdrop" onClick={() => setDebugOpen(false)}>
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="icon-button close" onClick={() => setDebugOpen(false)}>
              ×
            </button>
            <h2>Debug</h2>
            <Metric label="API" value={API_URL} />
            <Metric label="gameId" value={game?.id ?? "-"} />
            <Metric label="playerId" value={game?.player.id ?? "-"} />
            <Metric label="lastError" value={lastError || "-"} />
          </section>
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FinanceChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="finance-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const turnSteps = [
  { id: "dice", label: "Кубик" },
  { id: "move", label: "Рух" },
  { id: "event", label: "Подія" },
  { id: "done", label: "Готово" },
] as const;

type TurnPhase = (typeof turnSteps)[number]["id"];

function getTurnPhase(game: GameState): TurnPhase {
  if (game.status === "won") return "done";
  if (game.status === "pending") return "event";
  if (game.lastDice) return "done";
  return "dice";
}

function isStepComplete(step: TurnPhase, current: TurnPhase) {
  const stepIndex = turnSteps.findIndex((item) => item.id === step);
  const currentIndex = turnSteps.findIndex((item) => item.id === current);
  return stepIndex < currentIndex;
}

function guideSummary(game: GameState) {
  if (game.pendingAction) {
    return game.pendingAction.type === "deal"
      ? `${game.pendingAction.title}: +$${game.pendingAction.amount.toLocaleString("en-US")}`
      : `${game.pendingAction.title}: -$${game.pendingAction.amount.toLocaleString("en-US")}`;
  }

  if (game.status === "won") {
    return "Dream досягнуто";
  }

  return "Кинь кубик, щоб рухатись по треку.";
}

function guideTitle(game: GameState) {
  if (game.pendingAction) {
    return game.pendingAction.title;
  }

  if (game.status === "won") {
    return "Перемога";
  }

  return "Твій хід";
}

function guideHint(game: GameState) {
  if (game.pendingAction?.type === "deal") {
    return "Обери: “Прийняти” або “Пропустити”.";
  }

  if (game.pendingAction?.type === "expense") {
    return "Обери: “Оплатити” або “В кредит”.";
  }

  if (game.status === "won") {
    return "Гру завершено. Можна повернутись до лобі.";
  }

  return "Натисни “Кинути кубик”, щоб зробити хід.";
}

function actionKindLabel(action: NonNullable<GameState["pendingAction"]>) {
  if (action.type === "expense") {
    return "Витрата";
  }

  return action.category === "business" ? "Бізнес" : "Нерухомість";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getVisibleCells(board: CellType[], position: number, count: number) {
  if (board.length <= count) {
    return board.map((cell, index) => ({ cell, index }));
  }

  const half = Math.floor(count / 2);

  return Array.from({ length: count }, (_, offset) => {
    const index = (position - half + offset + board.length) % board.length;
    return { cell: board[index], index };
  });
}

export default App;
