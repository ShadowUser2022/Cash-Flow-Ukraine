# Feature branch: Stocks / Акції (v0.1)

Ціль: додати просту, “навчальну” механіку акцій як **окрему фічу в окремій гілці**, не ламаючи Core v0.

## 0) Назва гілки

`feature/stocks-v01`

## 1) Що саме додаємо (MVP)

### 1.1 Новий тип клітинки

- Додаємо `CellType: "stocks"` (акції).
- На Rat Race має бути **нечасто** (наприклад 2 клітинки з 24).
- На Fast Track може бути трішки частіше (опційно, не обов’язково в v0.1).

### 1.2 Актив “Акція”

Акції — це не “пасивний дохід”, а спекулятивний актив:

- В гравця є портфель позицій: `symbol`, `shares`, `avgPrice`.
- На клітинці `stocks` приходить подія, де можна:
  - **Купити** (якщо є кеш, або якщо не вистачає — можна докупити в кредит? v0.1: тільки кеш)
  - **Продати** (частину або все)
  - **Пропустити**

### 1.3 Проста модель ціни

Мета — щоб гравець бачив “ризик/волатильність” без складної біржі.

- Є набір 6–10 “тикерів” (наприклад: `AGRO`, `RETAIL`, `IT`, `ENERGY`, `BANK`, `REALTY`).
- Кожен тикер має:
  - `basePrice` (стартова)
  - `volatility` (амплітуда зміни)
  - `trendBias` (малий дрейф вгору/вниз)
- Ціна оновлюється **кожен хід** (або кожні N ходів) і зберігається у `GameState`.
  - v0.1: оновлюємо **кожен хід** на `roll`, навіть якщо не stocks-клітинка.

Формула (v0.1, проста):

- `delta = randomInt(-volatility, +volatility) + trendBias`
- `price = max(1, price + delta)`

## 2) UX / UI (MVP)

### 2.1 Дашборд (фінансова дошка)

Додати в “Доходи” або окремо під ним рядок:

- **“Портфель акцій”**: загальна вартість портфеля (mark-to-market)

Розрахунок:

- `portfolioValue = Σ(shares * currentPrice)`

### 2.2 Подія “Акції”

У pending-вікні показати:

- Заголовок: “Акції”
- Пояснення: “Купи дешевше — продай дорожче. Це ризик.”
- Табличка/список тикерів (по одному рядку):
  - `Тікер`
  - `Ціна зараз`
  - `У тебе: N шт.`
- Дії:
  - Вибір тикера
  - Інпут кількості `shares`
  - Кнопки: **Купити**, **Продати**, **Закрити/Пропустити**

v0.1 UX-спрощення:

- Купівля/продаж відбувається **за поточною ціною** без комісій.
- Нема лімітних заявок, тільки market.

## 3) API / Контракт

### 3.1 Типи (backend `backend/src/core.ts`)

Додати:

- `CellType` → `"stocks"`
- `Player.stocksPortfolio: StockPosition[]`

```ts
type StockSymbol = "AGRO" | "RETAIL" | "IT" | "ENERGY" | "BANK" | "REALTY";

type StockPosition = {
  symbol: StockSymbol;
  shares: number;
  avgPrice: number; // середня ціна входу
};

type StockMarket = Record<StockSymbol, { price: number; basePrice: number; volatility: number; trendBias: number }>;
```

Додати в `GameState`:

- `market: StockMarket`

### 3.2 PendingAction

Додати pending тип:

```ts
{ type: "stocks"; title: string; market: { symbol: StockSymbol; price: number }[]; portfolio: StockPosition[] }
```

### 3.3 Resolve

Поточний `resolvePending(gameId, accept)` не підходить, бо треба параметри (symbol, shares, side).

Варіант v0.1 (простий, без нових ендпоінтів):

- Додати **новий ендпоінт**:
  - `POST /api/core/stocks_trade`
  - body: `{ gameId, symbol, side: "buy"|"sell", shares }`
  - response: `GameState`

Правила:

- `shares` — ціле > 0
- BUY:
  - `cost = shares * price`
  - якщо `player.cash < cost` → помилка “Не вистачає готівки”
  - `cash -= cost`
  - оновити `position.avgPrice` (weighted average) і `shares`
- SELL:
  - якщо `позиції немає` або `shares > owned` → помилка
  - `cash += shares * price`
  - зменшити `shares`, якщо 0 — видалити позицію

Pending `stocks` після trade закривається (status → ready).

## 4) Ризики / не робити в v0.1

- Не змішувати з банком/кредитом (акції в кредит) — відкласти.
- Не додавати складні market events (краш/бум) — відкласти.
- Не міняти win-condition.

## 5) Acceptance criteria (чітко)

- На дошці інколи трапляється клітинка `stocks`, з’являється pending-подія “Акції”.
- Ціни тикерів зберігаються в `GameState` і змінюються по ходах.
- Можна купити акції тільки за кеш; cash зменшується коректно.
- Можна продати частину/все; cash збільшується коректно.
- “Портфель акцій” у UI показує сумарну поточну вартість.
- `npm run build` проходить.
- Нема лінт-помилок.

## 6) Test plan (мінімум, руками)

- Створити гру, дочекатися stocks-клітинки.
- BUY 1 share будь-якого тикера → cash ↓, портфель з’явився.
- Зробити 2–3 ходи → ціна змінюється.
- SELL 1 share → cash ↑, портфель змінюється/зникає при 0.

