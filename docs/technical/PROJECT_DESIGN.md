# Cashflow Online - Проектування системи
*Версія: 1.0 | Дата: 07.06.2025*

## 1. Аналіз вимог та цілі проекту

### 1.1 Загальний опис
**Cashflow Online** - це мультиплеєрна веб-гра, базована на настільній грі Роберта Кійосакі, з інтегрованим відеочатом та системою "плаваючих угод" для навчання фінансової грамотності через реальну взаємодію між гравцями.

### 1.2 Основні цілі
- **Освітня**: Навчання фінансової грамотності через гру
- **Соціальна**: Створення спільноти для обговорення фінансових стратегій
- **Технологічна**: Демонстрація сучасних веб-технологій (WebRTC, Socket.io)
- **Комерційна**: Потенціал монетизації через преміум функції

### 1.3 Функціональні вимоги

#### Основний геймплей:
- [x] Віртуальне ігрове поле з "Пасткою для щурів" та "Швидкою доріжкою"
- [x] Система кидання кубика та переміщення фігурок
- [x] Фінансовий звіт кожного гравця (доходи/витрати/активи/пасиви)
- [x] Картки угод (малі/великі/ринкові/дрібнички)
- [x] Система переговорів між гравцями
- [x] Умови перемоги (пасивний дохід > витрати)

#### Соціальна взаємодія:
- [x] Відеочат для всіх учасників (до 6 гравців)
- [x] Голосовий чат під час переговорів
- [x] Текстовий чат для швидких повідомлень
- [x] Система емоцій та реакцій
- [x] Можливість створювати приватні кімнати

#### Плаваючі угоди:
- [x] Динамічні угоди, що змінюються залежно від ринкових умов
- [x] Угоди між гравцями (партнерство, позики, спільні інвестиції)
- [x] Випадкові події ринку
- [x] Можливість створювати власні угоди

### 1.4 Нефункціональні вимоги
- **Продуктивність**: Підтримка 6 гравців з відео без затримок
- **Масштабованість**: До 100 одночасних ігор
- **Безпека**: Захист від читерства та маніпуляцій
- **Доступність**: Підтримка мобільних пристроїв
- **Інтернаціоналізація**: Підтримка української та англійської мов

## 2. Архітектура системи

### 2.1 Загальна архітектура (Поточна версія - In-Memory)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   In-Memory     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Storage       │
│                 │    │                 │    │                 │
│ - Game UI       │    │ - Game Logic    │    │ - Game State    │
│ - Video Chat    │    │ - Socket.io     │    │ - Map<ID,Game>  │
│ - Real-time     │    │ - WebRTC Signal │    │ - Auto Cleanup  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │              ┌─────────────────┐
        │              │   Future: Redis │
        │              │   + MongoDB     │
        │              │ - Session Data  │
        │              │ - Game State    │
        │              │ - Real-time     │
        └──────────────┴─────────────────┘
```

### 2.2 Мікросервісна архітектура
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Game Service   │  │  User Service   │  │  Chat Service   │
│                 │  │                 │  │                 │
│ - Game Logic    │  │ - Authentication│  │ - Video/Audio   │
│ - State Mgmt    │  │ - User Profiles │  │ - Text Messages │
│ - Rules Engine  │  │ - Statistics    │  │ - WebRTC Signal │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │  API Gateway    │
                    │                 │
                    │ - Routing       │
                    │ - Rate Limiting │
                    │ - Authentication│
                    └─────────────────┘
```

## 3. Технологічний стек

### 3.1 Frontend
```typescript
const frontendStack = {
  core: "React 18 + TypeScript",
  stateManagement: "Zustand (легший за Redux)",
  realtime: "Socket.io-client",
  video: "WebRTC + simple-peer",
  styling: "Styled-components + CSS Grid",
  animation: "Framer Motion",
  build: "Vite",
  testing: "Vitest + React Testing Library"
};
```

### 3.2 Backend
```typescript
const backendStack = {
  runtime: "Node.js 20+",
  framework: "Express.js",
  realtime: "Socket.io",
  database: "In-Memory Storage (поки без MongoDB)",
  cache: "Redis",
  authentication: "JWT + Passport",
  validation: "Joi",
  testing: "Jest + Supertest"
};
```

### 3.3 DevOps
```typescript
const devopsStack = {
  containerization: "Docker + Docker Compose",
  hosting: "DigitalOcean Droplets",
  cdn: "Cloudflare",
  monitoring: "PM2 + Winston",
  ci_cd: "GitHub Actions"
};
```

## 4. Дизайн бази даних

### 4.1 Поточне зберігання даних (In-Memory)

**УВАГА**: На поточному етапі використовується in-memory зберігання замість MongoDB для швидкого прототипування.

#### In-Memory Game Storage
```typescript
const games = new Map<string, Game>();

interface Game {
  id: string;  // 6-символьний код
  username: string;
  email: string;
  passwordHash: string;
  profile: {
    avatar?: string;
    displayName: string;
    country: string;
    preferredLanguage: 'uk' | 'en';
  };
  statistics: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;
    averageIncome: number;
  };
  preferences: {
    videoEnabled: boolean;
    audioEnabled: boolean;
    notifications: boolean;
  };
  createdAt: Date;
  lastActive: Date;
}
```

#### Games Collection
```typescript
interface Game {
  _id: ObjectId;
  roomCode: string;
  status: 'waiting' | 'in-progress' | 'completed';
  players: Array<{
    userId: ObjectId;
    position: number;
    isHost: boolean;
    joinedAt: Date;
  }>;
  settings: {
    maxPlayers: number;
    timeLimit?: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    language: 'uk' | 'en';
  };
  gameState: {
    currentPlayer: ObjectId;
    phase: 'rat-race' | 'fast-track';
    turn: number;
    market: MarketCondition;
  };
  createdAt: Date;
  completedAt?: Date;
}
```

#### GameStates Collection
```typescript
interface GameState {
  _id: ObjectId;
  gameId: ObjectId;
  players: Array<{
    userId: ObjectId;
    position: number;
    cash: number;
    financialStatement: {
      income: {
        salary: number;
        realEstate: number;
        business: number;
        other: number;
      };
      expenses: {
        taxes: number;
        housing: number;
        food: number;
        transportation: number;
        clothing: number;
        fun: number;
        other: number;
      };
      assets: Asset[];
      liabilities: Liability[];
    };
    profession: string;
    hasEscapedRatRace: boolean;
  }>;
  availableDeals: Deal[];
  marketConditions: MarketCondition;
  eventHistory: GameEvent[];
  updatedAt: Date;
}
```

#### Deals Collection
```typescript
interface Deal {
  _id: ObjectId;
  type: 'small-deal' | 'big-deal' | 'market' | 'doodad';
  category: 'real-estate' | 'business' | 'stocks' | 'commodities';
  title: string;
  description: string;
  requirements: {
    minCash?: number;
    minCashFlow?: number;
    profession?: string[];
  };
  financial: {
    cost: number;
    downPayment?: number;
    monthlyIncome?: number;
    mortgagePayment?: number;
    liability?: number;
  };
  negotiable: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  active: boolean;
}
```

### 4.2 Redis Cache Structure
```typescript
interface CacheStructure {
  // Активні ігри в пам'яті
  "game:{gameId}": GameState;
  
  // Сесії користувачів
  "session:{sessionId}": UserSession;
  
  // Лобі та кімнати очікування
  "lobby:waiting": string[]; // gameIds
  
  // WebRTC signaling
  "webrtc:{roomId}": SignalingData;
  
  // Статистика в реальному часі
  "stats:online": number;
  "stats:games-active": number;
}
```

## 5. API Специфікація

### 5.1 REST API Endpoints

#### Authentication
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/profile
```

#### Game Management
```typescript
POST /api/games/create        // Створити гру
GET  /api/games/join/:code    // Приєднатися до гри
POST /api/games/:id/start     // Почати гру
GET  /api/games/:id/state     // Отримати стан гри
POST /api/games/:id/leave     // Покинути гру
```

#### Gameplay Actions
```typescript
POST /api/games/:id/roll-dice      // Кинути кубик
POST /api/games/:id/buy-deal       // Купити угоду
POST /api/games/:id/make-offer     // Зробити пропозицію
POST /api/games/:id/accept-offer   // Прийняти пропозицію
POST /api/games/:id/end-turn       // Закінчити хід
```

### 5.2 WebSocket Events

#### Client → Server
```typescript
interface ClientEvents {
  'join-room': { gameId: string; userId: string };
  'roll-dice': { gameId: string };
  'move-player': { gameId: string; steps: number };
  'buy-deal': { gameId: string; dealId: string };
  'make-offer': { gameId: string; offer: Offer };
  'chat-message': { gameId: string; message: string };
  'video-signal': { gameId: string; signal: any; targetUserId: string };
}
```

#### Server → Client
```typescript
interface ServerEvents {
  'game-state-updated': GameState;
  'player-joined': { userId: string; username: string };
  'player-left': { userId: string };
  'dice-rolled': { playerId: string; result: number };
  'deal-purchased': { playerId: string; deal: Deal };
  'offer-made': Offer;
  'chat-message': { userId: string; username: string; message: string };
  'video-signal': { fromUserId: string; signal: any };
  'game-ended': { winner: string; statistics: GameStatistics };
}
```

## 6. UI/UX Дизайн

### 6.1 Основні екрани

#### Головна сторінка
```
┌─────────────────────────────────────────────────────────────────┐
│                        CASHFLOW ONLINE                         │
├─────────────────────────────────────────────────────────────────┤
│  [Створити гру]  [Приєднатися]  [Навчання]  [Профіль]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 Статистика:                    🎮 Активні ігри: 12        │
│  👥 Онлайн: 45                     ⏱️ Середня гра: 45 хв      │
│                                                                 │
│  📈 Топ гравці цього тижня:                                     │
│  1. Олександр - 8 перемог                                       │
│  2. Марина - 6 перемог                                          │
│  3. Дмитро - 5 перемог                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Ігровий екран
```
┌─────────────────────────────────────────────────────────────────┐
│ [🎥 Відео]    CASHFLOW - Кімната #ABC123    [⚙️ Налаштування]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐│
│  │                     │  │        Ігрове поле                  ││
│  │   Відео-чат         │  │                                     ││
│  │  ┌─────┐ ┌─────┐    │  │    ╔═══════════════════════════╗    ││
│  │  │👤Ви │ │👤Ana│    │  │    ║         ШВИДКА            ║    ││
│  │  └─────┘ └─────┘    │  │    ║        ДОРІЖКА            ║    ││
│  │  ┌─────┐ ┌─────┐    │  │    ╚═══════════════════════════╝    ││
│  │  │👤Max│ │👤Дан│    │  │   ╔═════════════════════════════╗   ││
│  │  └─────┘ └─────┘    │  │   ║      ПАСТКА ДЛЯ ЩУРІВ      ║   ││
│  │                     │  │   ║  🎯    🏠    💰    📊       ║   ││
│  │  💬 Чат:            │  │   ║ OLD  HOUSE SMALL MARKET     ║   ││
│  │  Ana: Хто купує?    │  │   ║      📍YOU                  ║   ││
│  │  Max: Я розглядаю   │  │   ╚═════════════════════════════╝   ││
│  │                     │  │                                     ││
│  └─────────────────────┘  └─────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  💰 Готівка: $2,500  |  📊 Пасивний дохід: $200  |  💸 Витрати: $1,500 │
│  [🎲 Кинути кубик]  [💼 Мої угоди]  [🤝 Переговори]  [📄 Звіт]    │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Мобільна адаптація
```
┌─────────────────────┐
│    CASHFLOW         │
├─────────────────────┤
│  🎥 [Ana] [Max]     │
│     [Дан] [YOU]     │
├─────────────────────┤
│                     │
│   ╔═══════════════╗ │
│   ║   ІГРОВЕ      ║ │
│   ║    ПОЛЕ       ║ │
│   ║      📍       ║ │
│   ║     YOU       ║ │
│   ╚═══════════════╝ │
│                     │
├─────────────────────┤
│ 💰 $2.5K | 📊 $200  │
│ [🎲] [💼] [🤝] [📄] │
└─────────────────────┘
```

### 6.3 Система переговорів
```
┌─────────────────────────────────────────────────────────────────┐
│                      ПЕРЕГОВОРИ - Угода #123                   │
│                         ⏰ Залишилось: 2:34                     │
├─────────────────────────────────────────────────────────────────┤
│  🏠 Duplex - $45,000  💰 Дохід: $400/міс  💸 Виплата: $300/міс   │
│                                                                 │
│  📝 Пропозиції:                                                │
│  • Анна: Купити за $40,000 (очікує відповіді)                  │
│  • Макс: Спільна покупка 50/50                                 │
│  • Ви: Купити за $42,000 (відхилено)                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 💬 Швидкий чат:                                            │ │
│  │ Анна: А якщо я доплачу $1000 за швидке оформлення?         │ │
│  │ Макс: Можемо розділити доходи 60/40?                       │ │
│  │ └─────────────────────────────────────────────────────────│ │
│  │ [Написати повідомлення...]                    [Відправити] │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [💰 Нова пропозиція]  [🤝 Прийняти угоду Анни]  [❌ Пропустити] │
└─────────────────────────────────────────────────────────────────┘
```

## 7. Ігрова логіка та механіки

### 7.1 Стартові професії
```typescript
const PROFESSIONS = {
  'teacher': {
    salary: 3300,
    expenses: 2600,
    startingCash: 400,
    description: 'Учитель - стабільна робота, низький ризик'
  },
  'engineer': {
    salary: 4900,
    expenses: 3900,
    startingCash: 1000,
    description: 'Інженер - добрий дохід, середні витрати'
  },
  'doctor': {
    salary: 13200,
    expenses: 9600,
    startingCash: 3600,
    description: 'Лікар - високий дохід, високі витрати'
  },
  'lawyer': {
    salary: 7500,
    expenses: 6000,
    startingCash: 1500,
    description: 'Юрист - хороший баланс доходів та витрат'
  }
};
```

### 7.2 Типи угод
```typescript
interface DealTypes {
  smallDeals: {
    realEstate: Deal[];    // Будинки $5K-$50K
    business: Deal[];      // Малий бізнес $1K-$10K
    stocks: Deal[];        // Акції $1-$40 за штуку
  };
  bigDeals: {
    realEstate: Deal[];    // Великі об'єкти $100K+
    business: Deal[];      // Великий бізнес $50K+
    apartments: Deal[];    // Багатоквартирні будинки
  };
  market: {
    everybody: Deal[];     // Загальні ринкові події
    youOnly: Deal[];      // Персональні пропозиції
  };
  doodads: {
    unnecessary: Deal[];   // Непотрібні покупки
    luxury: Deal[];       // Розкіш
  };
}
```

### 7.3 Система переговорів
```typescript
interface NegotiationSystem {
  timeLimit: number;           // 3 хвилини на переговори
  allowedActions: [
    'make_offer',              // Зробити пропозицію
    'counter_offer',           // Контр-пропозиція
    'accept_offer',            // Прийняти
    'decline_offer',           // Відхилити
    'create_partnership',      // Створити партнерство
    'request_loan',            // Попросити позику
    'offer_loan'               // Запропонувати позику
  ];
  chatEnabled: boolean;        // Чат під час переговорів
  anonymousOffers: boolean;    // Анонімні пропозиції
}
```

### 7.4 Умови перемоги
```typescript
const VICTORY_CONDITIONS = {
  ratRaceEscape: {
    condition: 'passiveIncome >= totalExpenses',
    description: 'Пасивний дохід покриває всі витрати'
  },
  fastTrackVictory: {
    condition: 'monthlyIncome >= startingIncome * 50 || netWorth >= 1000000',
    description: 'Дохід збільшився в 50 разів АБО статки $1M+'
  }
};
```

## 8. Безпека та протидія читерству

### 8.1 Валідація на сервері
```typescript
class GameValidator {
  validateMove(gameState: GameState, action: GameAction, userId: string): boolean {
    // Перевірка черги гравця
    if (gameState.currentPlayer !== userId) return false;
    
    // Валідація дій за правилами
    switch (action.type) {
      case 'buy_deal':
        return this.validatePurchase(gameState, action, userId);
      case 'make_offer':
        return this.validateOffer(gameState, action, userId);
      // ... інші дії
    }
  }
  
  validatePurchase(gameState: GameState, action: BuyDealAction, userId: string): boolean {
    const player = gameState.players.find(p => p.userId === userId);
    const deal = this.getAvailableDeal(action.dealId);
    
    // Перевірка наявності грошей
    if (player.cash < deal.cost) return false;
    
    // Перевірка вимог угоди
    if (deal.requirements.minCashFlow && player.passiveIncome < deal.requirements.minCashFlow) {
      return false;
    }
    
    return true;
  }
}
```

### 8.2 Анти-чит система
```typescript
class AntiCheatSystem {
  detectSuspiciousActivity(userId: string, actions: GameAction[]): boolean {
    // Перевірка на швидкість дій
    const actionsPerSecond = this.calculateAPS(actions);
    if (actionsPerSecond > 10) return true;
    
    // Перевірка на неможливі фінансові операції
    const financialFlow = this.analyzeFinancialFlow(actions);
    if (financialFlow.isImpossible) return true;
    
    // Перевірка на модифікацію клієнта
    const clientIntegrity = this.checkClientIntegrity(userId);
    if (!clientIntegrity.isValid) return true;
    
    return false;
  }
}
```

## 9. План розробки

### 9.1 Фаза 1: MVP (4 тижні)
**Тиждень 1-2: Базова інфраструктура**
- [x] Налаштування проекту (React + Node.js)
- [x] Базова аутентифікація
- [x] Socket.io інтеграція
- [x] Простий UI ігрового поля

**Тиждень 3-4: Основна логіка гри**
- [x] Система ходів та кубика
- [x] Базові фінансові розрахунки
- [x] Система карток угод
- [x] Збереження стану гри

### 9.2 Фаза 2: Соціальні функції (3 тижні)
**Тиждень 5-6: Відеочат**
- [x] WebRTC інтеграція
- [x] Базовий відеочат
- [x] Аудіо контроли

**Тиждень 7: Переговори**
- [x] Система пропозицій
- [x] Таймери переговорів
- [x] Текстовий чат

### 9.3 Фаза 3: Удосконалення (3 тижні)
**Тиждень 8-9: UX покращення**
- [x] Анімації та переходи
- [x] Мобільна адаптація
- [x] Звукові ефекти

**Тиждень 10: Тестування та деплой**
- [x] Юніт тести
- [x] Інтеграційні тести
- [x] Продакшн деплой

### 9.4 Фаза 4: Розширення (ongoing)
- [x] Система рейтингів
- [x] Турніри
- [x] Додаткові типи угод
- [x] Аналітика та статистика

## 10. Технічні деталі реалізації

### 10.1 Структура проекту (Актуальна після реорганізації)
```
Cash Flow Ukr/
├── docs/                   # 📚 Організована документація
│   ├── api/                # API документація
│   ├── technical/          # Технічна документація  
│   ├── user-guides/        # Інструкції користувача
│   ├── project-management/ # Управління проектом
│   └── README.md           # Індекс документації
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Компоненти UI
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand store
│   │   ├── services/       # API services
│   │   ├── utils/          # Утиліти
│   │   ├── types/          # TypeScript типи
│   │   └── constants/      # Константи
│   ├── public/
│   └── package.json
├── backend/                # Node.js Backend (Enhanced)
│   ├── src/
│   │   ├── controllers/    # API контролери
│   │   ├── services/       # Бізнес логіка (GameService, DealService)
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # TypeScript моделі
│   │   ├── sockets/        # Socket.io обробники
│   │   ├── utils/          # Утиліти
│   │   └── types/          # TypeScript типи
│   ├── config/             # Конфігураційні файли
│   ├── scripts/            # Скрипти запуску
│   ├── cashflow-server-enhanced.js  # Поточний сервер
│   └── package.json
├── shared/                 # Спільний код
│   ├── types/              # Спільні TypeScript типи
│   └── constants/          # Ігрові константи
├── scripts/                # Скрипти проекту
│   └── setup/              # Установчі скрипти
├── tests/                  # Тести
│   └── integration/        # Інтеграційні тести
│   ├── types/              # Спільні TypeScript типи
│   ├── constants/          # Константи
│   └── utils/              # Спільні утиліти
├── docker-compose.yml      # Docker конфігурація
└── README.md
```

### 10.2 Налаштування середовища розробки
```bash
# Клонування репозиторію
git clone <repository-url>
cd cashflow-online

# Встановлення залежностей
npm install

# Запуск у режимі розробки
npm run dev

# Запуск тестів
npm test

# Білд для продакшну
npm run build
```

### 10.3 Environment змінні
```bash
# .env.development
NODE_ENV=development
PORT=3001
~~MONGODB_URI=mongodb://localhost:27017/cashflow-dev~~ # Не використовується - in-memory storage
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=http://localhost:5173

# .env.production
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-production-db
REDIS_URL=redis://your-production-redis
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=https://your-domain.com
```

## 11. Висновки та наступні кроки

### 11.1 Ключові переваги проекту
- **Інноваційність**: Поєднання настільної гри з сучасними веб-технологіями
- **Освітня цінність**: Практичне навчання фінансової грамотності
- **Соціальна взаємодія**: Реальне спілкування між гравцями
- **Технологічна демонстрація**: Showcase сучасного стеку технологій

### 11.2 Потенційні виклики
- **Складність WebRTC**: Робота з відео у різних браузерах
- **Синхронізація стану**: Забезпечення консистентності для всіх гравців
- **Масштабованість**: Оптимізація під велику кількість одночасних ігор
- **Балансування гри**: Налаштування справедливих правил

### 11.3 План запуску
1. **Альфа-тестування**: Закрита група з 10-20 користувачів
2. **Бета-тестування**: Відкрита бета для 100-200 користувачів
3. **Офіційний запуск**: Публічний реліз з маркетинговою кампанією
4. **Ітеративне покращення**: Регулярні оновлення на основі фідбеку

---

*Цей документ буде оновлюватися в процесі розробки проекту. Версія 1.0 - базове проектування системи.*
