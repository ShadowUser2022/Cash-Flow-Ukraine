# 🎮 Cash Flow Ukraine - Глобальний Гід Проекту

## 📋 Огляд
**Cash Flow Ukraine** - це повноцінна мультиплеєрна онлайн-версія настільної гри Роберта Кійосакі "Cashflow", розроблена для навчання фінансової грамотності через ігровий процес.

---

## 🚀 Швидкий Старт

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

---

## 🏗️ Архітектура

### Backend (Node.js + TypeScript)
- **Express.js** - REST API
- **Socket.IO** - реального часу комунікація
- **In-memory storage** - зберігання стану ігор
- **TypeScript** - типобезпека

### Frontend (React + TypeScript)
- **React 19** + **Vite** - UI фреймворк та збірка
- **Zustand** - state management
- **Socket.IO Client** - реального часу з'єднання
- **Mobile Responsive** - адаптивний дизайн

---

## 🎮 Ігрова Механіка

### Основні компоненти:
- 🎲 **Система ходів** - кубик та переміщення по дошці
- 💰 **Фінансова симуляція** - доходи, витрати, інвестиції
- 🤝 **Переговори** - система угод між гравцями
- 🎥 **Відео чат** - WebRTC для живого спілкування
- 💬 **Текстовий чат** - реального часу повідомлення

### Ігрові режими:
- **Multiplayer** - до 6 гравців одночасно
- **Lobby System** - кімнати очікування
- **Real-time Updates** - миттєве оновлення стану

---

## 📚 Ключова Документація

### 🎯 **Основні документи (обов'язкові для ознайомлення):**
- **[GAME_RULES_AND_MECHANICS.md](./GAME_RULES_AND_MECHANICS.md)** - Повні правила гри та механіка
- **[DEVELOPMENT_STRATEGY.md](./DEVELOPMENT_STRATEGY.md)** - Стратегія розробки
- **[DEVELOPER_CHECKLIST.md](./DEVELOPER_CHECKLIST.md)** - Чекліст для розробників
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Швидкий довідник команд

### 💰 **Фінансова система:**
- **[FINANCIAL_SYSTEM_CENTRALIZATION_COMPLETE.md](./FINANCIAL_SYSTEM_CENTRALIZATION_COMPLETE.md)** - Архітектура фінансової системи
- **[FINANCIAL_TESTING_CHECKLIST.md](./FINANCIAL_TESTING_CHECKLIST.md)** - Тестування фінансових розрахунків

---

## 🛠️ Розробка

### Структура проекту:
```
Cash Flow Ukr/
├── backend/                 # Node.js + TypeScript backend
│   ├── src/
│   │   ├── controllers/     # REST API контролери
│   │   ├── services/        # Бізнес логіка
│   │   ├── sockets/        # Socket.IO handlers
│   │   └── models/         # TypeScript моделі
│   └── cashflow-server-enhanced.js  # Основний сервер
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React компоненти
│   │   ├── services/       # API та Socket.IO клієнти
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/         # TypeScript типи
├── shared/                # Спільні типи та константи
└── scripts/               # Скрипти автоматизації
```

### Корисні команди:
```bash
# Запуск серверів
./start-dev.sh          # Запустити backend + frontend
./stop-dev.sh           # Зупинити всі сервери

# Тестування
./test-financial-accuracy.sh           # Тестування фінансових розрахунків
./test-create-game-debug.sh            # Тестування створення гри
./test-financial-panel-sync.sh         # Тестування синхронізації панелей
```

---

## 🧪 Тестування

### Автоматизовані тести:
- **Фінансова точність** - перевірка розрахунків
- **Створення ігор** - валідація ігрових сесій
- **Socket.IO з'єднання** - тестування реального часу
- **UI компоненти** - перевірка інтерфейсів

### Ручне тестування:
1. Створення гри та підключення гравців
2. Перевірка фінансових операцій
3. Тестування відео чату
4. Валідація ігрової механіки

---

## 🚀 Розгортання

### Локальне середовище:
- **Backend**: порт 3001
- **Frontend**: порт 5173
- **Socket.IO**: автоматична конфігурація

### Продакшн (план):
- **Docker** контейнеризація
- **GitHub Actions** CI/CD
- **Cloud hosting** (Vercel/AWS)

---

## 🤝 Внесок у проект

### Процес розробки:
1. Створити feature branch
2. Реалізувати функціонал
3. Написати тести
4. Створити Pull Request

### Стандарти коду:
- **TypeScript** для всього коду
- **ESLint + Prettier** для форматування
- **Conventional Commits** для повідомлень
- **Тестове покриття** мінімум 80%

---

## 📞 Підтримка

### Контакти:
- 📧 Email: support@cashflowonline.com
- 🐛 Issues: GitHub Issues
- 💬 Discord: [посилання на сервер]

### Додаткові ресурси:
- **Документація API**: http://localhost:3001/api/docs
- **Інтерактивна дошка**: http://localhost:5173
- **Тестові скрипти**: `./scripts/tests/`

---

## 🎯 Наступні Кроки

### Для розробників:
1. 📖 Ознайомитись з правилами гри
2. 🏗️ Вивчити архітектуру проекту
3. 🧪 Запустити тести
4. 🚀 Почати з задач з чекліста

### Для тестувальників:
1. 🔄 Запустити локальне середовище
2. 🎮 Протестувати ігровий процес
3. 💰 Перевірити фінансові розрахунки
4. 📝 Повідомити про баги

---

**🎮 Ready to build the future of financial education gaming!**

*Останнє оновлення: 8 березня 2026*
