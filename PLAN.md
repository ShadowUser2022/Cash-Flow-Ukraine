# 🗺️ Cash Flow Ukraine — Master Development Plan
> Останнє оновлення: 16 березня 2026
> Стан: Backend (Railway) + Frontend (Vercel) — задеплоєно, працює

---

## ✅ Що вже зроблено

| Компонент | Статус |
|-----------|--------|
| Socket.IO інфраструктура | ✅ |
| Ігрова дошка (24 клітинки Rat Race + 16 Fast Track) | ✅ |
| Кубики + переміщення гравця | ✅ |
| PAYDAY — автоматична виплата зарплати | ✅ |
| Фінансова система (активи, пасиви, cash flow) | ✅ |
| Картки: Small Deals, Large Deals, Doodads, Market, Charity | ✅ |
| Спеціальні події: Baby 👶, Downsize 😱 | ✅ |
| WinScreen + конфеті 🏆 | ✅ |
| FinancialStatement (відображення балансу) | ✅ |
| Лоббі + чат + WebRTC скелет | ✅ |
| Авто-передача ходу (turn-completed) для non-card клітинок | ✅ |
| turn-completed listener на фронтенді | ✅ |
| Деплой Railway + Vercel | ✅ |

---

## 🚦 ФАЗИ РОЗРОБКИ

---

## ФАЗА 4 — Завершення ігрової механіки (ПОТОЧНА)
> **Мета:** Гравці можуть повністю грати: купувати активи, продавати, торгуватись

### Крок 4.1 — TransactionService: завершення фінансових операцій
**Файли:** `backend/src/services/transactionService.ts`

- [ ] `buyAsset(playerId, card, gameId)` → списати downPayment з cash, додати актив до балансу
- [ ] `sellAsset(playerId, assetId, salePrice)` → додати cash, видалити актив, перерахувати passive income
- [ ] `payExpense(playerId, amount, description)` → списати cash, записати в expenses
- [ ] `receiveIncome(playerId, amount, source)` → додати cash
- [ ] Перерахунок `passiveIncome` після кожної транзакції
- [ ] Перевірка умови перемоги після кожної транзакції

**Критичні правила:**
```
passiveIncome = сума всіх asset.cashFlow
cashFlow = salary + passiveIncome - totalExpenses
win = passiveIncome >= monthlyExpenses (тільки на Fast Track)
```

---

### Крок 4.2 — Deal Flow: прийняття/відхилення карток
**Файли:** `backend/cashflow-server-enhanced.js`, `frontend/src/components/DealsPanel/`

- [ ] Socket event `accept-deal` → викликати `buyAsset()` → відповідь `deal-completed`
- [ ] Socket event `reject-deal` → просто закрити карточку → передати хід
- [ ] Фронтенд: кнопки "Купити" / "Відхилити" надсилають правильні events
- [ ] Після прийняття deal → оновити GameState → розіслати всім гравцям
- [ ] Small Deal: тільки поточний гравець може прийняти
- [ ] Doodad: автоматичне списання (без вибору)

---

### Крок 4.3 — Large Deal Auction System
**Файли:** `backend/cashflow-server-enhanced.js`

- [ ] При витягуванні Large Deal — повідомити всіх гравців (`large-deal-drawn`)
- [ ] Socket event `place-bid` → зберегти bid в `game.currentAuction`
- [ ] Socket event `pass-bid` → позначити гравця як "пас"
- [ ] Коли всі зробили хід в аукціоні → визначити переможця (найвища ставка)
- [ ] Переможець: `buyAsset()` або `reject` якщо не вистачає грошей
- [ ] Таймер ставки: 30 секунд на кожного гравця (опційно)
- [ ] UI: панель аукціону з поточними ставками всіх гравців

---

### Крок 4.4 — Cell Actions: ефекти клітинок
**Файли:** `backend/cashflow-server-enhanced.js`, `backend/src/services/GameMechanicsService.ts`

| Клітинка | Дія |
|----------|-----|
| `charity` | Гравець може пожертвувати 10% зарплати → отримати бонус (кидок 2 кубики протягом 3 ходів) |
| `market` | Зміна ціни активів у всіх гравців (up/down event) |
| `lawsuit` | Списати фіксовану суму як витрати |
| `divorce` | Списати 50% cash |
| `tax-audit` | Списати 10% загального доходу |
| `baby` | ✅ вже зроблено |
| `downsize` | ✅ вже зроблено |

---

### Крок 4.5 — Selling Assets (продаж активів)
**Файли:** `frontend/src/components/FinancialStatement/`, `backend/cashflow-server-enhanced.js`

- [ ] Кнопка "Продати" поряд з кожним активом у FinancialStatement
- [ ] Socket event `sell-asset` з `{ assetId, playerId, salePrice }`
- [ ] Backend: перевірити чи є Market event (підвищена/знижена ціна)
- [ ] Оновити стан гравця після продажу

---

## ФАЗА 5 — Solo/Test Mode
> **Мета:** Мати можливість тестувати всі механіки без інших гравців

### Крок 5.1 — Solo Mode Backend
- [ ] При `create-game` з `{ mode: 'solo' }` → ігнорувати `min players` requirement
- [ ] Автоматичний "AI" гравець (bot) для демонстрації multi-player UI
- [ ] Гра стартує з 1 гравцем

### Крок 5.2 — Test Panel 🧪
**Файли:** `frontend/src/components/` (новий компонент `DevTestPanel`)

- [ ] Кнопка "Тест режим" (тільки в dev/localhost)
- [ ] Кнопки для ручного тригера будь-якої події:
  - Отримати Small Deal / Large Deal / Doodad
  - Trigger Baby / Downsize
  - Перемістити на будь-яку клітинку
  - Встановити Passive Income >= Monthly Expenses (тест перемоги)
  - Додати $10,000 cash

---

## ФАЗА 6 — Multiplayer Polish
> **Мета:** Плавний ігровий досвід для 2-6 гравців

### Крок 6.1 — Reconnection Logic
- [ ] При розриві з'єднання → зберегти стан сесії (30 хв)
- [ ] При реконекті → відновити gameState для гравця
- [ ] UI: "Гравець XYZ відключився / повернувся"

### Крок 6.2 — Turn Timer
- [ ] 90 секунд на хід гравця (таймер у UI)
- [ ] Якщо час вийшов → авто-пропуск ходу
- [ ] Попередження за 15 секунд

### Крок 6.3 — Game State Sync
- [ ] При підключенні нового гравця → надсилати повний `gameState`
- [ ] Reconciliation: якщо state відрізняється → request full sync
- [ ] Оптимізація: надсилати тільки diff (не весь gameState)

### Крок 6.4 — Spectator Mode
- [ ] Гравці можуть приєднатись як глядачі (без участі)
- [ ] Перегляд всіх дій в реальному часі

---

## ФАЗА 7 — Persistence & Auth
> **Мета:** Зберігати прогрес, мати акаунти гравців

### Крок 7.1 — MongoDB/PostgreSQL Integration
- [ ] Обрати БД (рекомендую PostgreSQL на Railway або MongoDB Atlas)
- [ ] Схема: `games`, `players`, `transactions`, `game_history`
- [ ] Мігрувати `gameStore` (Map) → БД
- [ ] Зберігати стан гри кожен хід

### Крок 7.2 — Authentication
- [ ] JWT tokens (простий варіант)
- [ ] або Google OAuth (зручніший для гравців)
- [ ] Гостьовий режим (без реєстрації, тимчасовий акаунт)

### Крок 7.3 — Player Profiles & Stats
- [ ] Статистика: ігор зіграно, перемог, середній дохід
- [ ] Лідерборд
- [ ]历ія ігор (replay)

---

## ФАЗА 8 — UI/UX Polish
> **Мета:** Гра виглядає і відчувається як продукт

### Крок 8.1 — Animations
- [ ] Анімація руху фішки по дошці (плавна)
- [ ] Анімація кидка кубиків (3D або CSS)
- [ ] Анімація отримання/втрати грошей (floating numbers)
- [ ] Transition між Rat Race → Fast Track

### Крок 8.2 — Sound Effects
- [ ] Кидок кубиків 🎲
- [ ] PAYDAY звук 💰
- [ ] Купівля активу 📈
- [ ] Програш/виграш 🏆
- [ ] Налаштування гучності

### Крок 8.3 — Mobile Optimization
- [ ] Responsive layout для планшетів
- [ ] Touch gestures для дошки
- [ ] Мобільна версія FinancialStatement

### Крок 8.4 — Accessibility
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] High contrast mode

---

## ФАЗА 9 — Testing & Quality
> **Мета:** Стабільна, протестована кодова база

### Крок 9.1 — Unit Tests
- [ ] TransactionService тести
- [ ] CardService тести
- [ ] GameMechanicsService тести
- [ ] Інструмент: Vitest (для TS/React)

### Крок 9.2 — Integration Tests
- [ ] Socket.IO event flow тести
- [ ] Full game loop тест (start → deal → buy → win)

### Крок 9.3 — E2E Tests
- [ ] Playwright: повний гральний сценарій
- [ ] Multi-player сценарій (2+ headless browsers)

---

## ФАЗА 10 — Launch Preparation
> **Мета:** Готовність до публічного запуску

- [ ] Landing page з описом гри
- [ ] Онбординг туторіал (перша гра)
- [ ] FAQ / правила гри
- [ ] Feedback форма для гравців
- [ ] Analytics (Mixpanel або Plausible)
- [ ] Error monitoring (Sentry)

---

## 📋 QUICK REFERENCE — Порядок пріоритетів

```
ЗАРАЗ (Фаза 4):
  4.1 → TransactionService (купівля активів)
  4.2 → Deal Accept/Reject flow
  4.3 → Large Deal Auction
  4.4 → Cell Actions (Charity, Market, Lawsuit...)
  4.5 → Selling Assets

ПОТІМ (Фаза 5):
  5.1 → Solo Mode
  5.2 → Dev Test Panel 🧪

ДАЛІ (Фаза 6):
  6.1 → Reconnection
  6.2 → Turn Timer
  6.3 → State Sync optimization

МАЙБУТНЄ (Фази 7-10):
  7 → DB + Auth
  8 → Animations + Sound
  9 → Tests
  10 → Launch
```

---

## 🔧 Технічний стек (довідка)

| Що | Де |
|----|-----|
| Backend entry | `backend/cashflow-server-enhanced.js` |
| Socket events | `backend/src/sockets/gameSocketHandler.ts` |
| Фінансова логіка | `backend/src/services/transactionService.ts` |
| Картки | `backend/src/services/CardService.ts` |
| Механіка гри | `backend/src/services/GameMechanicsService.ts` |
| Типи (shared) | `shared/types/game.ts` |
| Константи | `shared/constants/gameConstants.ts` |
| Zustand store | `frontend/src/store/gameStore.ts` |
| Хук ходу | `frontend/src/hooks/usePlayerTurnLogic.ts` |
| Головний UI | `frontend/src/components/GameInterface/` |

---

## 🚀 Деплой (довідка)

| | URL |
|-|-----|
| Frontend | https://cash-flow-ukraine.vercel.app |
| Backend | https://cash-flow-ukraine-production.up.railway.app |

**Деплой:**
- Frontend: push до `main` → Vercel auto-deploy
- Backend: push до `main` → Railway auto-deploy Docker

**⚠️ Важливо Railway:**
- Root Directory в Dashboard: порожньо
- Entry point: `cashflow-server-enhanced.js` (НЕ `cashflow-server.js`)

---

## 💬 Як користуватись цим файлом

**Коли починаєш новий чат:**
1. Скинь цей файл `PLAN.md` в чат
2. Скажи: "Продовжуємо з кроку X.Y"
3. Або: "Що далі по плану?"

**Коли завершуєш крок:**
- Постав ✅ поряд з виконаним пунктом
- Оновити дату вгорі

---

*Cash Flow Ukraine — вчимось фінансовій свободі граючи 🇺🇦*
