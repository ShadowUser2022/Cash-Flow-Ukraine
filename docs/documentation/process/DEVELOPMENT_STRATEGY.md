# 🎯 Cash Flow Ukraine - Стратегія розробки та механіки

## 📚 Призначення документу

Цей документ є **єдиним джерелом істини** для всієї команди розробки Cash Flow Ukraine. Всі рішення, механіки та підходи повинні відповідати цій стратегії.

---

## 🎮 Базова ігрова механіка (НЕЗМІННА ОСНОВА)

### Класична концепція Cashflow

**Cash Flow Ukraine** - це точна адаптація класичної гри Роберта Кійосакі з такими принципами:

```
🐭 RAT RACE (Щуряча гонка) → 🚀 FAST TRACK (Швидка доріжка) → 🏆 ПЕРЕМОГА
```

#### Основні правила (ЗАВЖДИ дотримуватися):

1. **Два кола гри**

   - Внутрішнє коло (Rat Race) - 24 клітинки
   - Зовнішнє коло (Fast Track) - 16 клітинок

2. **Умова переходу**

   ```javascript
   if (passiveIncome >= monthlyExpenses) {
     moveToFastTrack(player);
   }
   ```

3. **Умова перемоги**

   ```javascript
   if (player.isOnFastTrack && player.cash >= player.dream.cost) {
     winner = player;
   }
   ```

4. **Фінансова формула**
   ```
   Cash Flow = Passive Income + Salary - Expenses
   Financial Freedom = Passive Income ≥ Expenses
   ```

---

## 🔧 Архітектура системи

### Основні компоненти

#### 1. Frontend (React/TypeScript)

```
/frontend/src/
├── components/          # UI компоненти
│   ├── GameBoard/      # Ігрове поле
│   ├── PlayerPanel/    # Панель гравця
│   ├── CardSystem/     # Система карток
│   └── FinanceDash/    # Фінансовий дашборд
├── services/           # API взаємодія
├── store/              # Стан додатка
└── types/              # TypeScript типи
```

#### 2. Backend (Node.js/TypeScript)

```
/backend/src/
├── controllers/        # API контролери
├── services/          # Бізнес логіка
├── models/            # Дата моделі
└── utils/             # Утиліти
```

#### 3. Shared (Спільні типи)

```
/shared/types/
├── game.ts            # Ігрові типи
├── player.ts          # Типи гравця
└── cards.ts           # Типи карток
```

---

## 🎲 Детальна ігрова механіка

### Послідовність ходу (СТРОГО дотримуватися)

```javascript
// 1. Кидок кубика
const steps = rollDice();

// 2. Рух по полю
const newPosition = movePlayer(currentPlayer, steps);

// 3. Перевірка проходження через PAYDAY
if (passedPayday) {
  currentPlayer.cash += currentPlayer.salary;
}

// 4. Виконання дії клітинки
const cellAction = getCellAction(newPosition);
await executeCellAction(cellAction, currentPlayer);

// 5. Перевірка фінансової свободи
if (checkFinancialFreedom(currentPlayer)) {
  moveToFastTrack(currentPlayer);
}

// 6. Передача ходу
nextPlayer();
```

### Типи клітинок та їх обробка

#### Rat Race клітинки:

```javascript
const RAT_RACE_CELLS = {
  START: () => {
    /* Стартова позиція */
  },
  PAYDAY: (player) => {
    player.cash += player.salary;
  },
  SMALL_DEAL: (player) => {
    drawSmallDeal(player);
  },
  BIG_DEAL: (player) => {
    startAuction(getAllPlayers());
  },
  DOODAD: (player) => {
    drawExpense(player);
  },
  MARKET: (player) => {
    drawMarketEvent(player);
  },
  CHARITY: (player) => {
    offerCharity(player);
  },
  BABY: (player) => {
    player.expenses += 5000;
  },
  DOWNSIZED: (player) => {
    player.skipTurns = 2;
  },
};
```

#### Fast Track клітинки:

```javascript
const FAST_TRACK_CELLS = {
  DREAMS: (player) => {
    checkDreamAchievement(player);
  },
  CASHFLOW_DAY: (player) => {
    const multiplier = rollDice();
    player.cash += player.passiveIncome * multiplier;
  },
  BUSINESS: (player) => {
    drawBigBusiness(player);
  },
  LAWSUIT: (player) => {
    handleLawsuit(player);
  },
  DIVORCE: (player) => {
    player.cash = Math.floor(player.cash / 2);
    halveAssets(player);
  },
  TAX_AUDIT: (player) => {
    const penalty = player.totalIncome * 0.2;
    player.cash -= penalty;
  },
};
```

---

## 💰 Фінансова система

### Обов'язкові розрахунки

```typescript
// Розрахунок пасивного доходу
function calculatePassiveIncome(player: Player): number {
  return player.assets.reduce((total, asset) => {
    return total + asset.monthlyIncome;
  }, 0);
}

// Розрахунок щомісячних витрат
function calculateMonthlyExpenses(player: Player): number {
  return (
    player.baseExpenses +
    player.liabilities.reduce((total, liability) => {
      return total + liability.monthlyPayment;
    }, 0)
  );
}

// Перевірка фінансової свободи
function checkFinancialFreedom(player: Player): boolean {
  const passiveIncome = calculatePassiveIncome(player);
  const expenses = calculateMonthlyExpenses(player);
  return passiveIncome >= expenses;
}

// Перевірка можливості купівлі
function canAfford(player: Player, amount: number): boolean {
  return player.cash >= amount;
}
```

### Професії (Стартові налаштування)

```typescript
const PROFESSIONS = {
  PROGRAMMER: {
    salary: 25000,
    expenses: 18000,
    startingCash: 5000,
    startingDebt: 50000,
  },
  DOCTOR: {
    salary: 20000,
    expenses: 15000,
    startingCash: 8000,
    startingDebt: 80000,
  },
  TEACHER: {
    salary: 12000,
    expenses: 10000,
    startingCash: 3000,
    startingDebt: 20000,
  },
  // ... інші професії
};
```

---

## 🎴 Система карток

### Малі угоди (Small Deals)

```typescript
interface SmallDeal {
  id: string;
  name: string;
  description: string;
  totalPrice: number;
  downPayment: number;
  monthlyIncome: number;
  type: "real_estate" | "stocks" | "business" | "bonds";
}

// Приклад
const GARAGE_RENTAL: SmallDeal = {
  id: "garage_001",
  name: "Гараж в оренду",
  description: "Гараж в центрі міста",
  totalPrice: 15000,
  downPayment: 3000,
  monthlyIncome: 1200,
  type: "real_estate",
};
```

### Великі угоди (Big Deals)

```typescript
interface BigDeal {
  id: string;
  name: string;
  description: string;
  totalPrice: number;
  downPayment: number;
  monthlyIncome: number;
  requiresAuction: true;
  minBid: number;
}

// Приклад
const SHOPPING_CENTER: BigDeal = {
  id: "shopping_001",
  name: "Торговельний центр",
  description: "Великий ТЦ в спальному районі",
  totalPrice: 300000,
  downPayment: 60000,
  monthlyIncome: 25000,
  requiresAuction: true,
  minBid: 50000,
};
```

### Витрати (Doodads)

```typescript
interface Doodad {
  id: string;
  name: string;
  description: string;
  oneTimePayment?: number;
  monthlyExpenseIncrease?: number;
}

// Приклад
const NEW_IPHONE: Doodad = {
  id: "iphone_001",
  name: "Новий iPhone",
  description: "Найновіша модель",
  oneTimePayment: 35000,
  monthlyExpenseIncrease: 500,
};
```

---

## 🔄 Управління станом гри

### Стан гравця

```typescript
interface Player {
  id: string;
  name: string;
  profession: Profession;

  // Фінанси
  cash: number;
  salary: number;
  passiveIncome: number;
  totalExpenses: number;

  // Активи та пасиви
  assets: Asset[];
  liabilities: Liability[];

  // Позиція в грі
  position: number;
  isOnFastTrack: boolean;
  dream: Dream;

  // Стан ходу
  isCurrentPlayer: boolean;
  skipTurns: number;
}
```

### Стан гри

```typescript
interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  phase: "setup" | "playing" | "finished";
  winner?: string;

  // Колоди карток
  smallDeals: SmallDeal[];
  bigDeals: BigDeal[];
  doodads: Doodad[];
  marketEvents: MarketEvent[];
}
```

---

## 📋 Правила розробки

### 1. Код-стандарти

#### Назви функцій (ОБОВ'ЯЗКОВО):

```typescript
// Фінансові операції
calculatePassiveIncome();
calculateMonthlyExpenses();
checkFinancialFreedom();
canAfford();

// Ігрові дії
rollDice();
movePlayer();
executeCellAction();
nextPlayer();

// Картки
drawSmallDeal();
drawBigDeal();
drawDoodad();
startAuction();
```

#### Структура файлів:

```
- Максимум 200 рядків на файл
- Одна відповідальність на файл
- Чіткі імпорти/експорти
- TypeScript для всього коду
```

### 2. Тестування механіки

#### Обов'язкові тести:

```typescript
// Фінансові розрахунки
test("calculatePassiveIncome should sum all asset incomes");
test("checkFinancialFreedom should return true when passive >= expenses");
test("canAfford should check if player has enough cash");

// Ігрові механіки
test("movePlayer should update position correctly");
test("rollDice should return number between 1-6");
test("nextPlayer should cycle through players");

// Переходи між колами
test("player should move to FastTrack when financially free");
test("player should win when dream is achieved on FastTrack");
```

### 3. Використання констант

#### Завжди використовувати constants файл:

```typescript
import { GAME_CONSTANTS, GAME_HELPERS } from '../../../shared/constants/gameConstants';

// ✅ ПРАВИЛЬНО
const maxPlayers = GAME_CONSTANTS.GAME_SETTINGS.MAX_PLAYERS;
const programmerSalary = GAME_CONSTANTS.PROFESSIONS.PROGRAMMER.salary;
const isPayday = GAME_HELPERS.isPaydayCell(position);

// ❌ НЕПРАВИЛЬНО - магічні числа
const maxPlayers = 6;
const programmerSalary = 25000;
if (position === 6 || position === 12 || position === 18) // payday check
```

#### Валідація балансу гри:

```typescript
// Перевірка ROI угоди
const isBalanced = GAME_HELPERS.validateDealROI(monthlyIncome, totalPrice);

// Перевірка балансу професії
const isProfessionBalanced = GAME_HELPERS.validateProfessionBalance(
  salary,
  expenses
);
```

### 4. API Endpoints

#### Обов'язкові endpoints:

```typescript
// Управління грою
POST /api/games                    // Створити гру
GET /api/games/:id                 // Деталі гри
POST /api/games/:id/join           // Приєднатися до гри
POST /api/games/:id/start          // Почати гру

// Ігрові дії
POST /api/games/:id/roll-dice      // Кинути кубик
POST /api/games/:id/end-turn       // Закінчити хід
POST /api/games/:id/buy-deal       // Купити угоду
POST /api/games/:id/auction-bid    // Зробити ставку

// Фінансові операції
GET /api/games/:id/player/:playerId/finances  // Фінансовий стан
POST /api/games/:id/player/:playerId/pay      // Сплатити
```

---

## 🎯 Пріоритети розробки

### 🔗 Посилання на єдиний roadmap

**Основний документ планування:** `docs/project-management/ROADMAP.md`

Всі поточні та майбутні етапи розробки задокументовані в єдиному roadmap. Цей документ містить:

- Детальний стан кожного milestone
- Плани на спринти
- Технічні специфікації
- Ризики та міграції

**Завжди перевіряти roadmap перед початком роботи!**

### Поточний стан (березень 2026):

- **Milestone 2.3: Fast Track** - в активній розробці
- **Прогрес:** 70% завершено
- **Очікуване завершення:** квітень 2026

---

## 🔗 Посилання на ключові документи

- **🎯 docs/project-management/ROADMAP.md** - Єдиний roadmap проекту
- **🎮 GAME_RULES_AND_MECHANICS.md** - Повні правила гри
- **✅ DEVELOPER_CHECKLIST.md** - Чекліст розробника
- **⚡ QUICK_REFERENCE.md** - Швидкий довідник команд
- **🔢 shared/constants/gameConstants.ts** - Ігрові константи
- **🧩 shared/types/game.ts** - TypeScript типи
- **🎨 frontend/src/services/** - Frontend API
- **🔧 backend/src/services/** - Backend бізнес-логіка

**⚠️ ВАЖЛИВО**: Цей документ має оновлюватися при будь-яких архітектурних рішеннях. Всі зміни повинні бути узгоджені з командою.

---

_Документ створено: 5 серпня 2025_  
_Версія: 1.0.0_  
_Статус: Активний_
