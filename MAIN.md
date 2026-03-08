# 🎯 Cash Flow Ukraine - Головна Документація

## 📋 Зміст

1. [Огляд проекту](#огляд-проекту)
2. [Правила гри](#правила-гри)
3. [Архітектура системи](#архітектура-системи)
4. [Фінансова система](#фінансова-система)
5. [Технічна реалізація](#технічна-реалізація)
6. [Розробка та розгортка](#розробка-та-розгортка)

---

## 🎮 Огляд проекту

**Cash Flow Ukraine** - це повноцінна мультиплеєрна онлайн-версія настільної гри Роберта Кійосакі "Cashflow", розроблена для навчання фінансової грамотності через ігровий процес.

### Базова концепція Cashflow

🎯 **Два кола гри:**
1. **Rat Race (Щуряча гонка)** - внутрішнє коло, де люди працюють за зарплату
2. **Fast Track (Швидка доріжка)** - зовнішнє коло для фінансово вільних людей

### Ключові особливості

- 🎭 **Мультиплеєр до 6 гравців** одночасно
- 🎥 **Відео чат через WebRTC** для живого спілкування
- 💬 **Реального часу чат** та сповіщення
- 🤝 **Система переговорів** для спільних інвестицій
- 💰 **Реалістична фінансова симуляція**
- 🎲 **Повна ігрова механіка** (кубик, угоди, переміщення)
- 🔄 **Real-time оновлення** через Socket.IO

---

## 🎯 Правила гри

### Мета гри

**Основна мета:** Досягти фінансової свободи, коли пасивний дохід перевищує витрати
**Другорядна мета:** Купити мрію (визначена на початку гри)

### Умова перемоги

```javascript
if (passiveIncome >= expenses) {
  moveToFastTrack(player);
}

if (player.isOnFastTrack && player.cash >= player.dream.cost) {
  winner = player;
}
```

### Фінансова формула

```
Cash Flow = Passive Income + Salary - Expenses
Financial Freedom = Passive Income ≥ Expenses
```

### Ігрове поле

- **Rat Race:** 24 клітинки
- **Fast Track:** 16 клітинок

### Типи клітинок

#### Rat Race клітинки:
- **START** - початкова позиція
- **PAYDAY** - отримання зарплати
- **SMALL_DEAL** - малі угоди (нерухомість, бізнес)
- **BIG_DEAL** - великі угоди (аукціони)
- **DOODAD** - непотрібні покупки
- **MARKET** - фондовий ринок/події
- **CHARITY** - благодійність
- **BABY** - народження дитини
- **DOWNSIZED** - звільнення з роботи

#### Fast Track клітинки:
- **DREAMS** - перевірка досягнення мрії
- **CASHFLOW_DAY** - множник пасивного доходу
- **BUSINESS** - великі бізнес угоди
- **LAWSUIT** - судові позови
- **DIVORCE** - розлучення
- **TAX_AUDIT** - податкова перевірка

---

## 🏗️ Архітектура системи

### Frontend (React/TypeScript)

```
/frontend/src/
├── components/          # UI компоненти
│   ├── GameBoard/      # Ігрове поле
│   ├── PlayerPanel/    # Панель гравця
│   ├── GameInterface/  # Ігровий інтерфейс
│   ├── FinancialHeader/ # Фінансовий заголовок
│   └── GameInfoPanel/  # Інформаційна панель
├── services/           # API взаємодія
├── store/              # Стан додатка (Zustand)
├── types/              # TypeScript типи
└── hooks/              # Кастомні хуки
```

### Backend (Node.js/TypeScript)

```
/backend/src/
├── controllers/        # API контролери
├── services/          # Бізнес логіка
│   ├── GameService.ts # Логіка гри
│   ├── DealService.ts # Логіка угод
│   └── PlayerService.ts # Логіка гравців
├── models/            # Дата моделі
├── utils/             # Утиліти
└── socket/            # Socket.IO обробники
```

### Спільні типи

```
/shared/types/
├── game.ts            # Ігрові типи
├── player.ts          # Типи гравця
└── cards.ts           # Типи карток
```

---

## 💰 Фінансова система

### Обов'язкові розрахунки

```typescript
// Розрахунок пасивного доходу
function calculatePassiveIncome(player: Player): number {
  return player.assets.reduce((total, asset) => {
    return total + asset.cashFlow;
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
  return player.finances.passiveIncome >= player.finances.expenses;
}
```

### Професії

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
};
```

### Активи

```typescript
interface Asset {
  id: string;
  type: 'real-estate' | 'business' | 'stocks' | 'other';
  name: string;
  cost: number;
  cashFlow: number;        // Пасивний дохід щомісяця
  downPayment: number;
  mortgage: number;
  description: string;
}
```

---

## 🔧 Технічна реалізація

### Послідовність ходу

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

### API Endpoints

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

### WebSocket події

```typescript
// Основні події
'game:created'           // Гру створено
'player:joined'          // Гравець приєднався
'game:started'           // Гру почато
'dice:rolled'            // Кубик кинуто
'player:moved'           // Гравець перемістився
'deal:accepted'          // Угода прийнята
'game:finished'          // Гру завершено
```

---

## 🚀 Розробка та розгортка

### Вимоги

- **Node.js 18+**
- **npm або yarn**

### Запуск проекту

```bash
# Автоматичний запуск
./start-dev.sh

# Ручний запуск
cd backend && npm install && node cashflow-server-enhanced.js
cd frontend && npm install && npm run dev
```

### Адреси доступу

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Структура файлів

```
Cash Flow Ukr/
├── frontend/              # React додаток
├── backend/               # Node.js сервер
├── shared/                # Спільні типи
├── docs/                  # Документація
├── start-dev.sh          # Скрипт запуску
├── stop-dev.sh           # Скрипт зупинки
└── README.md             # Головний файл
```

### VS Code команди

```
🚀 Start Dev Servers    - Запустити все (Backend + Frontend)
🛑 Stop All Servers     - Зупинити все
🧪 Test Application     - Протестувати API
📦 Install Dependencies - Встановити залежності
```

---

## 🎯 Критерії готовності

### ✅ Реалізовано

- 🎲 **Базова ігрова механіка** - кубик, рух, події
- 💰 **Фінансова система** - розрахунки, активи, пасиви
- 🎴 **Система карток** - угоди, події, ринок
- 🤝 **Мультиплеєр** - WebSocket, синхронізація
- 💬 **Комунікація** - чат, відео зв'язок
- 🎨 **UI/UX** - адаптивний дизайн, анімації
- 📊 **Умови перемоги** - фінансова свобода, банкрутство

### 🔄 В процесі

- 🔄 Перехід на Fast Track (UI)
- 🔄 Аукціони для великих угод
- 🔄 Звукові ефекти
- 🔄 Система рейтингу

---

## 📞 Підтримка

### Корисні посилання

- **🎮 Інструкції для розробки** - `frontend/instructionForGame.md`
- **🔧 Стратегія розробки** - `DEVELOPMENT_STRATEGY.md`
- **📋 API документація** - `docs/api/REST-API.md`

### Правила розробки

- ✅ Дотримуватися класичних правил Cashflow
- ✅ Використовувати TypeScript для всього коду
- ✅ Одна відповідальність на файл
- ✅ Чіткі імена функцій
- ✅ Тестувати фінансові розрахунки

---

**🎮 Cash Flow Ukraine - Навчайте фінансовій свободі через гру!**

---

_Створено: 2025_  
_Версія: 1.0.0_  
_Статус: Активний_
