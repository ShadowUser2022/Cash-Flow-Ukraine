# ⚡ Швидкий довідник команд

## 🚀 Основні команди VS Code

### Запуск/Зупинка

```
🚀 Start Dev Servers    - Запустити все (Backend + Frontend)
🛑 Stop All Servers     - Зупинити все
🧪 Test Application     - Протестувати API
📦 Install Dependencies - Встановити залежності
```

### Ручні команди в терміналі

```bash
# Запуск
./start-dev.sh

# Зупинка
./stop-dev.sh

# Тест API
curl http://localhost:3001/health
curl http://localhost:3001/api/games
```

---

## 🌐 Порти та URL

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3001
Health:    http://localhost:3001/health
API:       http://localhost:3001/api/games
```

---

## 🎮 Ключові функції гри

### Фінансові розрахунки

```typescript
calculatePassiveIncome(player); // Пасивний дохід
calculateMonthlyExpenses(player); // Щомісячні витрати
checkFinancialFreedom(player); // Перевірка свободи
canAfford(player, amount); // Чи вистачає грошей
```

### Ігрова механіка

```typescript
rollDice(); // Кидок кубика (1-6)
movePlayer(player, steps); // Рух по полю
executeCellAction(cell, player); // Дія клітинки
nextPlayer(); // Наступний гравець
```

### Умови переходів

```typescript
// Перехід на Fast Track
if (passiveIncome >= expenses) {
  moveToFastTrack(player);
}

// Перемога
if (isOnFastTrack && cash >= dreamCost) {
  winner = player;
}
```

---

## 📂 Структура файлів

```
📁 Cash Flow Ukr/
├── 🤖 .github/instructions/AI_ASSISTANT.instructions.md ← ІНСТРУКЦІЇ ДЛЯ AI
├── 📋 DEVELOPMENT_STRATEGY.md     ← ЄДИНЕ ДЖЕРЕЛО ІСТИНИ
├── 🎮 GAME_RULES_AND_MECHANICS.md ← ПРАВИЛА ГРИ
├── ✅ DEVELOPER_CHECKLIST.md      ← ЧЕКЛІСТ
├── ⚡ QUICK_REFERENCE.md          ← ЦЕЙ ФАЙЛ
├── 🔧 backend/                    ← Сервер
├── 🎨 frontend/                   ← Інтерфейс
├── 🤝 shared/                     ← Спільні типи
└── 📚 docs/                       ← Документація
```

---

## 🎯 Пріоритети розробки

### ✅ Зроблено:

- Базова архітектура
- Документація правил
- Сервери налаштовані

### 🔄 В роботі:

- API endpoints
- Фінансові розрахунки
- Базовий UI

### 📝 Планується:

- Система карток
- Мультиплеєр
- Мобільна версія

---

## 🆘 SOS - Швидке рішення проблем

### Сервери не запускаються:

```bash
./stop-dev.sh
./start-dev.sh
```

### API не відповідає:

```bash
curl http://localhost:3001/health
```

### Порти зайняті:

```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### VS Code Tasks не видні:

```
Ctrl+Shift+P → "Tasks: Run Task"
```

---

## 🤔 Що робити, якщо...

### Не знаю правила гри:

→ Читай `GAME_RULES_AND_MECHANICS.md`

### Не знаю архітектуру:

→ Читай `DEVELOPMENT_STRATEGY.md`

### Не знаю з чого почати:

→ Читай `DEVELOPER_CHECKLIST.md`

### Хочу додати нову функцію:

1. Перевір `DEVELOPMENT_STRATEGY.md`
2. Переконайся, що не порушуєш правила Cashflow
3. Обговори з командою

---

_Завжди під рукою для швидкого доступу!_ ⚡
