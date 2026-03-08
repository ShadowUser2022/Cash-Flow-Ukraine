# 🗂️ ВІЗУАЛІЗАЦІЯ СТРУКТУРИ ПРОЕКТУ - Cash Flow Ukraine

## 🎯 Поточна структура (1 серпня 2025)

```
Cash Flow Ukraine/
├── 📁 frontend/                      # React + TypeScript + Vite
│   ├── 📁 src/
│   │   ├── 📄 App.tsx                # Головний компонент
│   │   ├── 📄 main.tsx               # Точка входу
│   │   │
│   │   ├── 📁 components/            # React компоненти
│   │   │   ├── 📁 GameInterface/     # 🎮 Основний ігровий інтерфейс
│   │   │   ├── 📁 GameBoard/         # 🎲 Ігрова дошка
│   │   │   ├── 📁 GameLobby/         # 🏠 Лобі гри
│   │   │   ├── 📁 CellEffects/       # ⚡ Ефекти клітинок
│   │   │   ├── 📁 PlayerPanel/       # 👤 Панель гравця
│   │   │   ├── 📁 FinancialHeader/   # 💰 Фінансовий лічильник (НОВИЙ!)
│   │   │   ├── 📁 DealsPanel/        # 💼 Панель угод
│   │   │   ├── 📁 DiceRoller/        # 🎲 Кубик
│   │   │   ├── 📁 VideoChat/         # 📹 Відео чат
│   │   │   ├── 📁 Chat/              # 💬 Текстовий чат
│   │   │   ├── 📁 DreamSelection/    # ⭐ Вибір мрій
│   │   │   └── 📁 PlayerFinancesSummary/ # 📊 Фінансове резюме
│   │   │
│   │   ├── 📁 hooks/                 # React хуки
│   │   │   ├── 📄 usePlayerFinances.ts
│   │   │   ├── 📄 useDeals.ts
│   │   │   └── 📄 useWebRTC.ts
│   │   │
│   │   ├── 📁 services/              # Бізнес логіка
│   │   │   ├── 📄 socketService.ts   # Socket.IO клієнт
│   │   │   ├── 📄 BoardMovement.ts   # Рух по дошці
│   │   │   └── 📄 FinancialIntegration.ts
│   │   │
│   │   ├── 📁 store/                 # Zustand стор
│   │   │   └── 📄 gameStore.ts
│   │   │
│   │   ├── 📁 types/                 # TypeScript типи
│   │   │   ├── 📄 index.ts
│   │   │   └── 📄 game.ts
│   │   │
│   │   ├── 📁 constants/             # Константи
│   │   │   └── 📄 socketEvents.ts
│   │   │
│   │   └── 📁 utils/                 # Утиліти
│   │       ├── 📄 animations.ts
│   │       ├── 📄 logger.ts
│   │       └── 📄 performanceMonitor.ts
│   │
│   ├── 📄 package.json               # Залежності frontend
│   ├── 📄 vite.config.ts            # Конфігурація Vite
│   └── 📄 tsconfig.json             # TypeScript конфігурація
│
├── 📁 backend/                       # Node.js + TypeScript
│   ├── 📄 cashflow-server-enhanced.js # Головний сервер
│   ├── 📄 package.json               # Залежності backend
│   │
│   └── 📁 src/                       # TypeScript сирці
│       ├── 📁 controllers/           # HTTP контролери
│       ├── 📁 services/              # Бізнес логіка сервера
│       ├── 📁 sockets/               # Socket.IO обробники
│       ├── 📁 models/                # Моделі даних
│       ├── 📁 types/                 # Типи backend
│       └── 📁 utils/                 # Серверні утиліти
│
├── 📁 shared/                        # Спільний код
│   ├── 📁 types/                     # Спільні типи
│   └── 📁 constants/                 # Спільні константи
│
├── 📁 docs/                          # Документація
│   ├── 📄 README.md                  # Індекс документації
│   ├── 📁 project-management/        # Управління проектом
│   │   ├── 📄 ROADMAP.md
│   │   ├── 📄 MVP_ROADMAP.md
│   │   └── 📄 SPRINT_PLAN.md
│   │
│   ├── 📁 technical/                 # Технічна документація
│   │   ├── 📄 TECHNICAL_ARCHITECTURE.md
│   │   └── 📄 PROJECT_DESIGN.md
│   │
│   ├── 📁 user-guides/               # Гайди користувача
│   │
│   └── 📁 archive/                   # Архів (НОВИЙ!)
│       └── 📁 2025-07/               # Архівовані файли за липень
│           ├── 📁 implementation-complete/
│           └── 📁 session-summaries/
│
├── 📁 scripts/                       # Скрипти автоматизації
│   ├── 📄 start-dev.sh              # Запуск dev серверів
│   ├── 📄 stop-dev.sh               # Зупинка серверів
│   └── 📄 test-*.sh                 # Тестові скрипти
│
├── 📄 README.md                      # Головний README
├── 📄 TODAY_PLAN.md                  # Поточний план роботи
├── 📄 UX_STABILITY_ROADMAP_2025_08_01.md # Roadmap на сьогодні
└── 📄 DOCUMENTATION_CLEANUP_PLAN.md  # План очищення документації
```

---

## 🎯 КЛЮЧОВІ КОМПОНЕНТИ

### ⚡ **Нові компоненти (додані сьогодні):**

- `FinancialHeader/` - Лічильник фінансів у верхній частині гри

### 🔥 **Основні робочі компоненти:**

- `GameInterface/` - Центральний компонент гри
- `CellEffects/` - Обробка ефектів клітинок
- `PlayerPanel/` - Панель з інформацією про гравця
- `GameBoard/` - Ігрова дошка з Rat Race та Fast Track

### 🧠 **Логіка та дані:**

- `gameStore.ts` - Централізований стан гри (Zustand)
- `socketService.ts` - Real-time комунікація
- `usePlayerFinances.ts` - Хук для роботи з фінансами
- `FinancialIntegration.ts` - Фінансові розрахунки

---

## 📊 СТАТИСТИКА ПРОЕКТУ

### 📁 **Кількість файлів:**

- **React компонентів**: ~15
- **TypeScript файлів**: ~25
- **CSS файлів**: ~15
- **Хуків**: 3
- **Сервісів**: 5
- **Документації**: 20+ (після очищення ~8 активних)

### 🧹 **Останнє очищення:** 1 серпня 2025

- Архівовано 16 implementation файлів
- Архівовано 3 summary файли
- Видалено 2 дублікати планів
- Результат: чиста структура документації

---

## 🚀 **Швидка навігація:**

### Розробка:

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3001`
- **Start dev**: `./start-dev.sh`

### Документація:

- **Головний план**: `TODAY_PLAN.md`
- **UX Roadmap**: `UX_STABILITY_ROADMAP_2025_08_01.md`
- **Технічна архітектура**: `docs/technical/`

### Тестування:

- **Фінансова система**: `./test-finance-integration.sh`
- **Карткові дії**: `./test-event-cards-financial-flow.sh`

---

_Останнє оновлення: 1 серпня 2025, 10:30_
