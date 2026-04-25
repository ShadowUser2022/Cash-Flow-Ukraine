import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { api, API_URL, type CellType, type Dream, type GameState, type StartProfile, type StockSymbol } from "./lib/api";

const sessionKey = "cash-flow-clean-session";
function App() {
  const [playerName, setPlayerName] = useState("");
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [profiles, setProfiles] = useState<StartProfile[]>([]);
  const [selectedDream, setSelectedDream] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [ratRace, setRatRace] = useState<CellType[]>([]);
  const [fastTrack, setFastTrack] = useState<CellType[]>([]);
  const [game, setGame] = useState<GameState | null>(null);
  const [connection, setConnection] = useState<"checking" | "ok" | "error">("checking");
  const [lastError, setLastError] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [rollState, setRollState] = useState<"idle" | "rolling" | "revealed" | "moving">("idle");
  const [revealedDice, setRevealedDice] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockSymbol>("AGRO");
  const [stockShares, setStockShares] = useState("1");

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 760);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const visibleCellCount = isMobile ? 3 : 5;
  const board = game?.player.track === "fast" ? fastTrack : ratRace;
  const position = game?.player.track === "fast" ? game.player.fastPosition : game?.player.position;
  const visibleBoard = useMemo(
    () => getVisibleCells(board, position ?? 0, visibleCellCount),
    [board, position, visibleCellCount],
  );
  const canRoll = game?.status === "ready" && rollState === "idle";
  const turnPhase = useMemo(() => (game ? getTurnPhase(game, rollState) : "dice"), [game, rollState]);
  const fastTrackProgress = game
    ? Math.min(100, Math.round((game.player.passiveIncome / game.player.expenses) * 100))
    : 0;
  const portfolioValue = useMemo(() => {
    if (!game) return 0;
    return game.player.stocksPortfolio.reduce((sum, pos) => sum + pos.shares * (game.market[pos.symbol]?.price ?? 0), 0);
  }, [game]);

  const salaryCountdown = useMemo(() => {
    if (!game) return null;
    const every = 10;
    const since = game.turn - game.lastSalaryTurn;
    const left = Math.max(0, every - since);
    return { left, every };
  }, [game]);
  async function bootstrap() {
    try {
      await api.health();
      setConnection("ok");

      const meta = await api.meta();
      setDreams(meta.dreams);
      setProfiles(meta.profiles);
      setSelectedDream((current) => current || meta.dreams[0]?.id || "");
      setSelectedProfile((current) => current || meta.profiles[0]?.id || "");
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
      setLastError(error instanceof Error ? error.message : "Не вдалося підключитися до сервера");
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
      setLastError(error instanceof Error ? error.message : "Дію не виконано");
      setConnection("error");
    }
  }

  async function startGame() {
    await run(() => api.newGame(playerName, selectedDream, selectedProfile));
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
      setLastError(error instanceof Error ? error.message : "Дію не виконано");
      setConnection("error");
      setRollState("idle");
      setRevealedDice(null);
    }
  }

  async function tradeStocks(side: "buy" | "sell") {
    if (!game || game.pendingAction?.type !== "stocks") return;
    const shares = Math.floor(Number(stockShares));
    await run(() => api.stocksTrade(game.id, selectedStock, side, shares));
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
          <span className="back-icon">←</span>
          <span className="back-text">До лобі</span>
        </button>
      )}

      <header className={`top-bar ${connection}`}>
        <div className="brand">
          <strong>Грошовий Потік Україна</strong>
          <span>{game ? "Соло" : "Лобі"}</span>
        </div>
        <div className="server-chip">
          <strong>{connection === "ok" ? "Готово" : connection === "checking" ? "Синхр." : "Помилка"}</strong>
          <span>{connection === "ok" ? "З'єднання активне" : lastError || "Перевірка сервера..."}</span>
          <button className="icon-button" onClick={() => setDebugOpen(true)} aria-label="Дані гри">
            i
          </button>
        </div>
      </header>

      {game && (
        <section className="status-rail" aria-label="Стан гри">
          <strong>{game.player.name}</strong>
          <span>{trackLabel(game.player.track)}</span>
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
            <h2>Обери персонажа</h2>
            {profiles.map((profile) => (
              <label key={profile.id} className="dream-card">
                <input
                  type="radio"
                  checked={selectedProfile === profile.id}
                  onChange={() => setSelectedProfile(profile.id)}
                />
                <span>
                  <strong>{profile.title}</strong>
                  <small>
                    Старт: {formatMoney(profile.cash)} · Зарплата: {formatMoney(profile.salary)} · Витрати:{" "}
                    {formatMoney(profile.expenses)}
                  </small>
                  <small>{profile.description}</small>
                </span>
              </label>
            ))}

            <h2>Обери мрію</h2>
            <p className="section-hint">
              Щоб перемогти: стань на клітинку мрії та май достатньо грошей для її оплати.
            </p>
            {dreams.map((dream) => (
              <label key={dream.id} className="dream-card">
                <input
                  type="radio"
                  checked={selectedDream === dream.id}
                  onChange={() => setSelectedDream(dream.id)}
                />
                <span>
                  <strong>{dream.title}</strong>
                  <small>Ціль виграшу: {formatMoney(dream.cost)}</small>
                </span>
              </label>
            ))}
          </div>

          <button
            className="primary"
            disabled={!playerName.trim() || !selectedDream || !selectedProfile || connection !== "ok"}
            onClick={startGame}
          >
            Почати соло-гру
          </button>

          <details>
            <summary>Як працює базова гра</summary>
            <div className="rules-card">
              <strong>Мета гри</strong>
              <p>Збери перші 10 000 грн, збільшуй пасивний дохід і дійди до своєї мрії.</p>
              <ul>
                <li>Кинь кубик і перемісти фішку на нову клітинку.</li>
                <li>Прочитай подію клітинки: угода, витрата, зарплата або мрія.</li>
                <li>В угодах рахуй: ціна, дохід і витрати. Якщо грошей не вистачає, можна взяти кредит у банку.</li>
                <li>Підробіток/подарунок/спадок дається на клітинці “Підробіток” (кожного разу).</li>
                <li>Зарплата нараховується раз на 10 ходів (з підтвердженням і розрахунком).</li>
                <li>Коли пасивний дохід стане більшим за витрати, відкриється швидкісна доріжка.</li>
              </ul>
              <small>Програти теж можна: якщо борги й витрати заведуть готівку в мінус.</small>
            </div>
          </details>
        </section>
      ) : (
        <section className="game-grid">
          <div className="panel event-panel">
            <div className="guide-copy">
              <div className="guide-title-line">
                <span
                  className={`turn-phase-dot ${turnPhaseDotClass(turnPhase)}`}
                  aria-label={turnPhaseLabel(turnPhase)}
                  title={turnPhaseLabel(turnPhase)}
                />
                <h2>{guideTitle(game)}</h2>
                {game.pendingAction ? (
                  <strong className={`amount-badge ${game.pendingAction.type}`}>
                    {pendingAmountLabel(game.pendingAction)}
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
              {game.status === "won" || game.status === "bankrupt" ? (
                <button className="primary" onClick={exitGame}>
                  До лобі
                </button>
              ) : game.pendingAction ? (
                <div className="action-cluster">
                  <div className="action-context">
                    <span>{actionKindLabel(game.pendingAction)}</span>
                    <strong>{game.pendingAction.title}</strong>
                    <em>{pendingAmountLabel(game.pendingAction)}</em>
                    {game.pendingAction.type === "deal" && (
                      <div className="deal-details">
                        <div className="deal-layout">
                          <div className="deal-copy">
                            <p>{game.pendingAction.description}</p>
                            <small>{game.pendingAction.hint}</small>
                          </div>
                          <div className="deal-math deal-math-rows" aria-label="Розрахунок угоди">
                            <span>Ціна: {formatMoney(game.pendingAction.price)}</span>
                            <span>Дохід: +{formatMoney(game.pendingAction.income)} / міс.</span>
                            <span>Витрати: -{formatMoney(game.pendingAction.expenses)} / міс.</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {game.pendingAction.type === "expense" && (
                      <div className="deal-details">
                        <p>{game.pendingAction.description}</p>
                        <p>
                          Повна оплата зараз: -{formatMoney(game.pendingAction.amount)} з готівки.
                        </p>
                        <small>
                          В кредит: +{formatMoney(game.pendingAction.creditPayment)} до щомісячних витрат.
                        </small>
                      </div>
                    )}
                    {game.pendingAction.type === "freelance" && (
                      <div className="deal-details">
                        <small>
                          Додано до готівки: {formatMoney(game.pendingAction.amount)} · Було{" "}
                          {formatMoney(game.pendingAction.cashBefore)} → Стало {formatMoney(game.pendingAction.cashAfter)}
                        </small>
                      </div>
                    )}
                    {game.pendingAction.type === "salary" && (
                      <div className="deal-details">
                        <div className="deal-math">
                          <span>Зарплата: +{formatMoney(game.pendingAction.salary)}</span>
                          <span>Пасивний дохід: +{formatMoney(game.pendingAction.passiveIncome)}</span>
                          <span>Витрати: -{formatMoney(game.pendingAction.expenses)}</span>
                        </div>
                        {game.pendingAction.debtPayment > 0 && (
                          <small>
                            Автопогашення боргу: -{formatMoney(game.pendingAction.debtPayment)} · Борг{" "}
                            {formatMoney(game.pendingAction.bankDebtBefore)} → {formatMoney(game.pendingAction.bankDebtAfter)}
                          </small>
                        )}
                        <small>
                          Разом за період: {formatMoney(game.pendingAction.net)} · Було{" "}
                          {formatMoney(game.pendingAction.cashBefore)} → Стало {formatMoney(game.pendingAction.cashAfter)}
                        </small>
                      </div>
                    )}
                    {game.pendingAction.type === "level-up" && (
                      <div className="deal-details">
                        <p>{game.pendingAction.description}</p>
                        <small>Натисни “Зрозуміло”, щоб перейти на швидкісну доріжку.</small>
                      </div>
                    )}
                    {game.pendingAction.type === "stocks" && (
                      <div className="deal-details">
                        <p>Купи дешевше — продай дорожче. Це ризик.</p>
                        <div className="stocks-grid" aria-label="Ринок акцій">
                          <label className="stocks-field">
                            Тікер
                            <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value as StockSymbol)}>
                              {game.pendingAction.market.map((item) => (
                                <option key={item.symbol} value={item.symbol}>
                                  {item.symbol} · {formatMoney(item.price)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="stocks-field">
                            Кількість (шт.)
                            <input
                              inputMode="numeric"
                              value={stockShares}
                              onChange={(e) => setStockShares(e.target.value)}
                              placeholder="1"
                            />
                          </label>
                        </div>
                        <small>
                          У тебе:{" "}
                          {game.pendingAction.portfolio.find((p) => p.symbol === selectedStock)?.shares ?? 0} шт.
                        </small>
                      </div>
                    )}
                  </div>
                  {game.pendingAction.type === "stocks" ? (
                    <div className="action-row">
                      <button className="primary" onClick={() => void tradeStocks("buy")}>
                        Купити
                      </button>
                      <button onClick={() => void tradeStocks("sell")}>Продати</button>
                      <button onClick={() => run(() => api.resolvePending(game.id, false))}>Пропустити</button>
                    </div>
                  ) : (
                    <div className="action-row">
                      <button
                        className="primary"
                        disabled={isPrimaryActionDisabled(game)}
                        onClick={() => run(() => api.resolvePending(game.id, true))}
                      >
                        {primaryActionLabel(game.pendingAction)}
                      </button>
                      {showSecondaryAction(game.pendingAction) && (
                        <button onClick={() => run(() => api.resolvePending(game.id, false))}>
                          {secondaryActionLabel(game.pendingAction)}
                        </button>
                      )}
                    </div>
                  )}
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

          <section className="finance-board" aria-label="Фінанси">
            <div className="goal-strip" aria-label="Мета">
              <div className="goal-chip">
                <span>Мета</span>
                <strong>
                  Ціна мрії: {formatMoney(game.player.dream.cost)} · Швидкісна:{" "}
                  {formatMoney(game.player.passiveIncome)} / {formatMoney(game.player.expenses)}
                </strong>
                <div className="progress-track" aria-hidden="true">
                  <span style={{ width: `${fastTrackProgress}%` }} />
                </div>
              </div>
            </div>

            <div className="finance-groups" aria-label="Фінансова дошка">
              <div className="finance-group">
                <header>
                  <strong>Доходи</strong>
                  <span>
                    {game.pendingAction?.type === "salary"
                      ? "сьогодні день зарплати"
                      : salaryCountdown
                        ? `до зарплати: ${salaryCountdown.left} ход(и)`
                        : "що приносить гроші"}
                  </span>
                </header>
                <div className="finance-rows">
                  <FinanceRow label="Готівка" value={formatMoney(game.player.cash)} />
                  <FinanceRow label="Зарплата" value={formatMoney(game.player.salary)} hint="Нарахування раз на 10 ходів" />
                  <FinanceRow label="Пасивний дохід" value={formatMoney(game.player.passiveIncome)} />
                  <FinanceRow label="Портфель акцій" value={formatMoney(portfolioValue)} hint="поточна вартість портфеля" />
                  <FinanceRow
                    label="Баланс / міс."
                    value={formatMoney(game.player.salary + game.player.passiveIncome - game.player.expenses)}
                    hint="зарплата + пасивний дохід - витрати"
                  />
                </div>
              </div>

              <div className="finance-group">
                <header>
                  <strong>Витрати + банк</strong>
                  <span>що забирає гроші</span>
                </header>
                <div className="finance-rows">
                  <FinanceRow label="Разом витрати / міс." value={formatMoney(game.player.expenses)} />
                  <FinanceRow
                    label="Борг банку"
                    value={formatMoney(game.player.bankDebt)}
                    hint="Ліміт: 50 000 грн (інакше банкрутство)"
                  />
                  <div className="expenses-breakdown" aria-label="Розкладка витрат">
                    <FinanceRow label="Оренда" value={formatMoney(game.player.expensesBreakdown.rent)} />
                    <FinanceRow label="Діти" value={formatMoney(game.player.expensesBreakdown.kids)} />
                    <FinanceRow
                      label="Відсотки банку"
                      value={formatMoney(game.player.expensesBreakdown.bankInterest)}
                      hint="Платежі за кредити та угоди"
                    />
                    <FinanceRow label="Їжа" value={formatMoney(game.player.expensesBreakdown.food)} />
                    <FinanceRow label="Комунальні + інше" value={formatMoney(game.player.expensesBreakdown.utilities)} />
                    <FinanceRow label="Розваги" value={formatMoney(game.player.expensesBreakdown.fun)} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="panel board">
            <div className="board-header">
              <h2>{trackLabel(game.player.track)}</h2>
              <span>вікно дошки · позиція: {position}</span>
            </div>
            <div className="board-window">
              <span className="edge-hint left">ще</span>
              <div className={`cells ${rollState === "moving" ? "slide-left" : ""}`}>
                {visibleBoard.map(({ cell, index }) => (
                  <div key={`${cell}-${index}`} className={`cell ${cell} ${index === position ? "active" : ""}`}>
                    <span>{cellLabel(cell)}</span>
                    <small>{cellHint(cell)}</small>
                    {index === position && <strong>ТИ</strong>}
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
            <h2>Дані гри</h2>
            <Metric label="Адреса сервера" value={API_URL} />
            <Metric label="ID гри" value={game?.id ?? "-"} />
            <Metric label="ID гравця" value={game?.player.id ?? "-"} />
            <Metric label="Остання помилка" value={lastError || "-"} />
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

function FinanceRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="finance-row">
      <div className="finance-row-label">
        <span>{label}</span>
        {hint && <small className="chip-hint">{hint}</small>}
      </div>
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

function getTurnPhase(game: GameState, rollState: "idle" | "rolling" | "revealed" | "moving"): TurnPhase {
  if (game.status === "won" || game.status === "bankrupt") return "done";
  if (game.status === "pending") return "event";
  if (rollState === "moving") return "move";
  if (rollState === "rolling" || rollState === "revealed") return "dice";
  if (game.lastDice) return "done";
  return "dice";
}

function turnPhaseLabel(phase: TurnPhase) {
  switch (phase) {
    case "dice":
      return "Етап: кубик";
    case "move":
      return "Етап: рух";
    case "event":
      return "Етап: подія";
    case "done":
      return "Етап: готово";
    default:
      return "Етап";
  }
}

function turnPhaseDotClass(phase: TurnPhase) {
  switch (phase) {
    case "dice":
      return "phase-dice";
    case "move":
      return "phase-move";
    case "event":
      return "phase-event";
    case "done":
      return "phase-done";
    default:
      return "";
  }
}

function guideSummary(game: GameState) {
  if (game.pendingAction) {
    return pendingAmountLabel(game.pendingAction);
  }

  if (game.status === "won") {
    return "Мрію досягнуто";
  }

  if (game.status === "bankrupt") {
    return "Банкрутство";
  }

  return "Кинь кубик, щоб рухатись по дошці.";
}

function guideTitle(game: GameState) {
  if (game.pendingAction) {
    return game.pendingAction.title;
  }

  if (game.status === "won") {
    return "Перемога";
  }

  if (game.status === "bankrupt") {
    return "Банкрутство";
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

  if (game.pendingAction?.type === "salary") {
    return "Це зарплата раз на 10 ходів. Перевір розрахунок і підтвердь.";
  }

  if (game.pendingAction?.type === "freelance") {
    return "Підробіток нарахувався одразу. Натисни “Зрозуміло”, щоб продовжити.";
  }

  if (game.pendingAction?.type === "level-up") {
    return "Пасивний дохід вищий за витрати. Наступний рівень відкрито.";
  }

  if (game.status === "won") {
    return "Гру завершено. Можна повернутись до лобі.";
  }

  if (game.status === "bankrupt") {
    return "Готівка пішла в мінус. Гру програно.";
  }

  if (game.message && !game.message.startsWith("Гра створена")) {
    return game.message;
  }

  return "Натисни “Кинути кубик”, щоб зробити хід.";
}

function actionKindLabel(action: NonNullable<GameState["pendingAction"]>) {
  if (action.type === "salary") {
    return "Зарплата";
  }

  if (action.type === "freelance") {
    return "Підробіток";
  }

  if (action.type === "level-up") {
    return "2-й рівень";
  }

  if (action.type === "expense") {
    return "Витрата";
  }

  if (action.type === "stocks") {
    return "Акції";
  }

  return action.category === "business" ? "Бізнес" : "Нерухомість";
}

function primaryActionLabel(action: NonNullable<GameState["pendingAction"]>) {
  if (action.type === "salary" || action.type === "freelance" || action.type === "level-up") {
    return "Зрозуміло";
  }

  if (action.type === "expense") {
    return `Оплатити ${formatMoney(action.amount)}`;
  }

  if (action.type === "deal") {
    return `Купити за ${formatMoney(action.price)}`;
  }

  return "Продовжити";
}

function isPrimaryActionDisabled(game: GameState) {
  const action = game.pendingAction;

  return action?.type === "expense" && game.player.cash < action.amount;
}

function secondaryActionLabel(action: NonNullable<GameState["pendingAction"]>) {
  if (action.type === "expense") {
    return `В кредит +${formatMoney(action.creditPayment)}/міс`;
  }

  return "Пропустити";
}

function showSecondaryAction(action: NonNullable<GameState["pendingAction"]>) {
  return action.type === "deal" || action.type === "expense";
}

function pendingAmountLabel(action: NonNullable<GameState["pendingAction"]>) {
  if (action.type === "deal") {
    return `Ціна ${formatMoney(action.price)}`;
  }

  if (action.type === "expense") {
    return `-${formatMoney(action.amount)}`;
  }

  if (action.type === "salary") {
    return `${action.net >= 0 ? "+" : "-"}${formatMoney(Math.abs(action.net))}`;
  }

  if (action.type === "freelance") {
    return `+${formatMoney(action.amount)}`;
  }

  if (action.type === "stocks") {
    return "Ринок";
  }

  return "Новий рівень";
}

function trackLabel(track: GameState["player"]["track"]) {
  return track === "fast" ? "Швидкісна доріжка" : "Щурячі перегони";
}

function cellLabel(cell: CellType) {
  const labels: Record<CellType, string> = {
    payday: "Підробіток",
    deal: "Угода",
    expense: "Витрата",
    dream: "Мрія",
    stocks: "Акції",
  };

  return labels[cell];
}

function cellHint(cell: CellType) {
  const hints: Record<CellType, string> = {
    payday: "Підробіток або подарунок",
    deal: "Можна купити актив",
    expense: "Плати зараз або в кредит",
    dream: "Перевірка цілі виграшу",
    stocks: "Купи або продай",
  };

  return hints[cell];
}

function formatMoney(value: number) {
  return `${value.toLocaleString("uk-UA")} грн`;
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
