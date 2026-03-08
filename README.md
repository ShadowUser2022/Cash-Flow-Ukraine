# 🎮 Cashflow Online Game - Enhanced Edition ✅

**СТАН: ПОВНІСТЮ ІНТЕГРОВАНО - Готово до тестування**

Повноцінна мультиплеєрна онлайн-версія настільної гри Роберта Кійосакі "Cashflow", розроблена з використанням сучасних веб-технологій та повністю інтегрованою ігровою логікою.

## 🎯 Опис проекту

**Cashflow Online** — це освітня фінансова гра, яка навчає принципам інвестування, пасивного доходу та фінансової незалежності через ігровий процес. Гравці починають з професії в "Щурячих перегонах" і працюють над тим, щоб перейти на "Швидку доріжку" через розумні інвестиції та управління грошовими потоками.

### ✨ Ключові особливості:

- 🎭 **Мультиплеєр до 6 гравців** одночасно
- 🎥 **Відео чат через WebRTC** для живого спілкування
- 💬 **Реального часу чат** та сповіщення
- 🤝 **Система переговорів** для спільних інвестицій
- 💰 **Реалістична фінансова симуляція**
- 🎲 **Повна ігрова механіка** (кубик, угоди, переміщення)
- 🔄 **Real-time оновлення** через Socket.IO

## ✅ Поточний стан проекту

### 🟢 Повністю готово:

- **Backend Enhanced**: TypeScript + Express + Socket.IO
- **Ігрові сервіси**: DealService, GameMechanicsService, GameService
- **API**: Повний набір endpoints для гри
- **In-memory зберігання**: Працює без MongoDB
- **Real-time**: Socket.IO події налаштовані
- **Frontend**: React + Vite готовий до інтеграції

### 📚 Документація:

**🎯 ГОЛОВНІ ДОКУМЕНТИ (ОБОВ'ЯЗКОВІ ДЛЯ ОЗНАЙОМЛЕННЯ):**

- **🤖 [.github/instructions/AI_ASSISTANT.instructions.md](./.github/instructions/AI_ASSISTANT.instructions.md)** - **ІНСТРУКЦІЇ ДЛЯ AI** (єдине розуміння проекту)
- **📋 [DEVELOPMENT_STRATEGY.md](./DEVELOPMENT_STRATEGY.md)** - **ЄДИНЕ ДЖЕРЕЛО ІСТИНИ** для всієї команди
- **🎮 [GAME_RULES_AND_MECHANICS.md](./GAME_RULES_AND_MECHANICS.md)** - Повні правила гри та механіка
- **✅ [DEVELOPER_CHECKLIST.md](./DEVELOPER_CHECKLIST.md)** - Чекліст для розробників
- **⚡ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Швидкий довідник команд

**📚 Технічна документація:**

- **🏗️ [docs/technical/TECHNICAL_ARCHITECTURE.md](./docs/technical/TECHNICAL_ARCHITECTURE.md)** - Технічна архітектура
- **[📚 Documentation Index](./docs/README.md)** - Центральний індекс документації
- **[🎯 API Reference](./docs/api/REST-API.md)** - Повна API документація
- **[🏗️ Technical Docs](./docs/technical/)** - Технічна документація
- **[👨‍💻 User Guides](./docs/user-guides/)** - Інструкції користувача
- **[📋 Project Management](./docs/project-management/)** - Управління проектом

## 🚀 Швидкий старт - Enhanced & Organized Edition

### Вимоги

- **Node.js 18+** ✅ (встановлено)
- **npm або yarn** ✅ (встановлено)
- ~~MongoDB~~ (тепер використовується in-memory storage)

### Запуск проекту

**🚀 Автоматична установка (рекомендовано):**

```bash
# Запустити скрипт автоматичної установки
./scripts/setup/install.sh
```

**🔧 Ручна установка:**

```bash
# 1. Встановлення залежностей
cd backend && npm install
cd ../frontend && npm install

# 2. Запуск enhanced backend
cd backend
node cashflow-server-enhanced.js
# ✅ Server запущено на http://localhost:3001

# 3. Запуск frontend (в іншому терміналі)
cd frontend && npm run dev
# ✅ Frontend запущено на http://localhost:5173
```

### ✅ Перевірка роботи:

- 🔍 **Backend health**: http://localhost:3001/health
- 🎮 **Frontend додаток**: http://localhost:5173
- 📡 **API ігор**: http://localhost:3001/api/games
- 📚 **Центральна документація**: [./docs/README.md](./docs/README.md)
- 🧪 **Інструкції тестування**: [./docs/user-guides/](./docs/user-guides/)

### 🎯 Швидкий тест API:

```bash
# Створити гру
curl -X POST http://localhost:3001/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"hostId": "test-user"}'

# Перевірити статус
curl http://localhost:3001/health
```

## 📁 Актуальна структура проекту (після реорганізації)

```
Cash Flow Ukr/
├── docs/                      # 📚 Організована документація
│   ├── api/                   # API документація
│   │   └── REST-API.md       # Повна REST API документація
│   ├── technical/             # Технічна документація
│   │   ├── TECHNICAL_ARCHITECTURE.md
│   │   ├── ENHANCED_INTEGRATION_COMPLETE.md
│   │   └── PROJECT_DESIGN.md
│   ├── user-guides/          # Інструкції користувача
│   ├── project-management/   # Управління проектом
│   │   ├── ROADMAP.md        # План розробки
│   │   ├── SPRINT_PLAN.md    # Sprint планування
│   │   └── USER_STORIES.md   # Користувацькі історії
│   └── README.md             # Індекс документації
├── backend/                   # 🔧 Node.js + TypeScript backend (Enhanced)
│   ├── src/
│   │   ├── controllers/       # REST API контролери (TypeScript)
│   │   ├── services/          # Бізнес логіка (GameService, DealService)
│   │   ├── sockets/           # Socket.IO handlers
│   │   ├── models/            # TypeScript моделі
│   │   └── middleware/        # Express middleware
│   ├── config/                # Конфігураційні файли
│   ├── scripts/               # Скрипти запуску
│   ├── cashflow-server-enhanced.js  # Поточний робочий сервер
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  # 🎨 React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # React компоненти
│   │   ├── store/             # Zustand state management
│   │   ├── services/          # API та Socket.IO клієнти
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript типи
│   ├── package.json
│   └── vite.config.ts
├── shared/                    # 🔄 Спільні типи та константи
│   ├── types/                 # Спільні TypeScript типи
│   └── constants/             # Ігрові константи
├── scripts/                   # 🚀 Скрипти проекту
│   └── setup/
│       └── install.sh        # Автоматична установка
└── tests/                     # 🧪 Тести
    └── integration/          # Інтеграційні тести
```

## 🛠️ Технологічний стек

### Backend:

- **Node.js** + **TypeScript** - сервер та типобезпека
- **Express.js** - REST API
- **Socket.IO** - реального часу комунікація
- **In-memory Storage** - зберігання стану ігор (готово для майбутнього переходу на MongoDB)
- **JWT** - авторизація (планується)

### Frontend:

- **React 18** + **TypeScript** - UI фреймворк
- **Vite** - швидка збірка та розробка
- **Zustand** - state management
- **Socket.IO Client** - реального часу з'єднання
- **WebRTC** - відео чат

### DevOps:

- **Docker** - контейнеризація (планується)
- **GitHub Actions** - CI/CD (планується)

## 📊 Поточний статус

### ✅ ЗАВЕРШЕНО (Milestone 1):

- ✅ **Повна технічна основа** - Backend + Frontend + DB
- ✅ **TypeScript без помилок** - весь код типізований
- ✅ **Socket.IO namespaces** - /game та /webrtc готові
- ✅ **REST API** - створення та отримання ігор
- ✅ **Середовище розробки** - сервери запущені та працюють

### 🚧 В РОЗРОБЦІ (Milestone 2):

- 🔄 **Система підключення гравців** до ігор
- 🔄 **Лобі гри** з готовністю та професіями
- 🔄 **Ігрова дошка** та візуалізація стану

### 📋 ЗАПЛАНОВАНО:

- 🎲 Механіка кидання кубика та ходів
- 💰 Фінансова панель та розрахунки
- 🤝 Система угод та переговорів
- 🎥 WebRTC відео чат
- 💬 Система чату та сповіщень

## 📚 Документація

### Плани розробки:

- **[📖 ROADMAP.md](./docs/project-management/ROADMAP.md)** - Повний план з 9 milestone'ів
- **[📋 SPRINT_PLAN.md](./docs/project-management/SPRINT_PLAN.md)** - Поточний sprint та задачі
- **[📝 USER_STORIES.md](./docs/project-management/USER_STORIES.md)** - Детальні stories з acceptance criteria

### Технічна документація:

- **[🏗️ TECHNICAL_ARCHITECTURE.md](./docs/technical/TECHNICAL_ARCHITECTURE.md)** - Архітектура системи
- **[🎨 PROJECT_DESIGN.md](./docs/technical/PROJECT_DESIGN.md)** - Дизайн та UX

### API Документація:

```bash
# Health checks
GET /health                     # Загальний health check
GET /api/games/health/check     # Game service health

# Game management
POST /api/games/create          # Створення нової гри
GET /api/games/:gameId          # Отримання інформації про гру
HEAD /api/games/:gameId         # Перевірка існування гри
```

### Socket.IO Events:

```typescript
// Namespace: /game
"join-game"; // Приєднання до гри
"leave-game"; // Вихід з гри
"player-ready"; // Готовність гравця
"start-game"; // Початок гри
"roll-dice"; // Кидання кубика

// Namespace: /webrtc
"offer"; // WebRTC offer
"answer"; // WebRTC answer
"ice-candidate"; // ICE candidates
```

## 🧪 Тестування

```bash
# Backend тести
cd backend && npm test

# Frontend тести
cd frontend && npm test

# E2E тести (планується)
npm run test:e2e
```

## 🤝 Внесок у проект

1. Fork репозиторію
2. Створіть feature branch (`git checkout -b feature/amazing-feature`)
3. Зафіксуйте зміни (`git commit -m 'Add amazing feature'`)
4. Push до branch (`git push origin feature/amazing-feature`)
5. Створіть Pull Request

### Стандарти коду:

- TypeScript для всього коду
- ESLint + Prettier для форматування
- Conventional Commits для повідомлень
- Покриття тестами мінімум 80%

## 📄 Ліцензія

MIT License - деталі у файлі [LICENSE](LICENSE)

## 👥 Команда

- **Lead Developer** - [Ваше ім'я]
- **Game Designer** - [Ім'я дизайнера]
- **UI/UX Designer** - [Ім'я дизайнера]

## 📞 Підтримка

- 📧 Email: support@cashflowonline.com
- 💬 Discord: [посилання на Discord сервер]
- 🐛 Issues: [GitHub Issues](https://github.com/yourrepo/cashflow/issues)

---

## 🎯 Наступні кроки

### Для розробників:

1. 📖 Ознайомтеся з [ROADMAP.md](ROADMAP.md) для розуміння загального плану
2. 📋 Перегляньте [SPRINT_PLAN.md](SPRINT_PLAN.md) для поточних задач
3. 📝 Вивчіть [USER_STORIES.md](USER_STORIES.md) для розуміння requirements
4. 🏗️ Почніть з задач з пріоритетом P0 в поточному спринті

### Для тестувальників:

1. Запустіть локальне середовище
2. Протестуйте створення та отримання ігор через API
3. Перевірте Socket.IO з'єднання
4. Повідомте про знайдені баги в Issues

### Для дизайнерів:

1. Ознайомтеся з [PROJECT_DESIGN.md](PROJECT_DESIGN.md)
2. Створіть mockup'и для наступного спринту
3. Підготуйте assets та іконки

---

**🎮 Ready to build the future of financial education gaming!**

_Останнє оновлення: 7 червня 2025_
