# 🎯 Cash Flow Ukraine - Правила та Логіка Гри

## 📋 Загальні Правила

### 🎯 Мета Гри
- **Основна мета:** Досягти фінансової свободи, коли пасивний дохід перевищує витрати
- **Другорядна мета:** Купити мрію (визначена на початку гри)
- **Переможна умова:** `passiveIncome > expenses`

### 💰 Фінансові Показники
- **Cash Flow:** `salary + passiveIncome - expenses`
- **Фінансова свобода:** `passiveIncome >= expenses`
- **Банкрутство:** `cash < 0` та неможливість покрити витрати

---

## 🎮 Ігровий Процес

### 🎲 Кидок Кубика та Рух
1. Гравець кидає кубик (1-6)
2. Переміщується на відповідну кількість клітинок
3. На клітинці виникає подія/картка
4. Гравець приймає рішення (прийняти/відхилити)

### 📊 Типи Клітинок та Подій

#### 💼 Робочі Клітинки (Rat Race)
- **START** - початкова позиція
- **PAYDAY** - отримання зарплати (`salary`)
- **EXPENSE** - додаткові витрати
- **OPPORTUNITY** - можливість купити активи
- **MARKET** - фондовий ринок/події
- **CHARITY** - благодійність (податкові знижки)
- **DOWNSIZE** - звільнення (втрата роботи)
- **DOODAD** - непотрібні покупки

#### 🚀 Швидка Доріжка (Fast Track)
- Доступна після досягнення фінансової свободи
- Великі інвестиційні можливості
- Менші ризики
- Дохід у мільйонах

---

## 📈 Фінансова Логіка

### 💵 Доходи
```
totalIncome = salary + passiveIncome
```
- **Salary:** Фіксована зарплата від професії
- **Passive Income:** Дохід від активів (нерухомість, бізнес, акції)

### 💸 Витрати
```
totalExpenses = fixedExpenses + variableExpenses
```
- **Fixed:** Податки, іпотека, страховка
- **Variable:** DOODAD, благодійність, екстрені витрати

### 🏢 Активи
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

### 📉 Пасиви
```typescript
interface Liability {
  id: string;
  name: string;
  amount: number;
  interestRate?: number;
  monthlyPayment?: number;
}
```

---

## 🎯 Умови Перемоги та Програшу

### 🏆 Перемога
```typescript
const isWinner = player.finances.passiveIncome >= player.finances.expenses;
```
**Коли перемога:**
- Пасивний дохід ≥ витрат
- Показати модальне вікно "🎉 ВІТАЄМО, ВИ ПЕРЕМОГЛИ!"
- Описати шлях до успіху
- Можливість продовжити гру на швидкій доріжці

### 💔 Банкрутство
```typescript
const isBankrupt = player.finances.cash < 0 && !hasAssetsToSell;
```
**Коли банкрутство:**
- Гроші < 0
- Немає активів для продажу
- Показати модальне вікно "💔 ВИ БАНКРУТ"
- Описати помилки та поради

---

## 🎪 Події та Їх Обробка

### 📈 Акції (Stock Events)
```typescript
// Хороші акції
if (type === 'stock-good' || type === 'stock-opportunity') {
  // Створити актив + пасивний дохід
  newAsset = {
    type: 'stocks',
    cashFlow: investment * 0.05  // 5% щомісяця
  };
}

// Погані акції  
if (type === 'stock-bad' || type === 'stock-crash') {
  // Втрата грошей + видалення активів
  player.cash -= loss;
  removeCheapestStock();
}
```

### 🏠 Нерухомість (Real Estate)
```typescript
if (type === 'real-estate') {
  // Додати актив з іпотекою
  newAsset = {
    type: 'real-estate',
    cashFlow: rent - mortgagePayment
  };
}
```

### 💼 Бізнес (Business)
```typescript
if (type === 'business') {
  // Бізнес з високим ризиком та доходом
  newAsset = {
    type: 'business',
    cashFlow: profit - expenses
  };
}
```

---

## 🎮 Ігрові Стани

### 🔄 Стан Гри
```typescript
enum GameState {
  WAITING = 'waiting',           // Очікування гравців
  PLAYING = 'playing',           // Гра в процесі
  PAUSED = 'paused',             // Пауза
  FINISHED = 'finished',         // Гра завершена
  BANKRUPTCY = 'bankruptcy'       // Банкрутство гравця
}
```

### 🎯 Стан Гравця
```typescript
enum PlayerState {
  ACTIVE = 'active',             // Активний хід
  WAITING = 'waiting',           // Очікує ходу
  FINANCIAL_FREE = 'free',       // Фінансово вільний
  BANKRUPT = 'bankrupt',         // Банкрут
  RETIRED = 'retired'            // Вийшов з гри
}
```

---

## 🎨 UI/UX Логіка

### 📱 Модальні Вікна
```typescript
// Перемога
showModal({
  type: 'victory',
  title: '🎉 ВІТАЄМО, ВИ ПЕРЕМОГЛИ!',
  message: `Ви досягли фінансової свободи!\nПасивний дохід: ${formatCurrency(passiveIncome)}\nВитрати: ${formatCurrency(expenses)}`,
  actions: ['Продовжити на Fast Track', 'Завершити гру']
});

// Банкрутство
showModal({
  type: 'bankruptcy',
  title: '💔 ВИ БАНКРУТ',
  message: `На жаль, ви втратили всі гроші.\nГотівка: ${formatCurrency(cash)}\nРекомендації: ...`,
  actions: ['Спробувати знову', 'Повернутися в лобі']
});
```

### 🎯 Індикатори Прогресу
```typescript
const progressToFreedom = Math.min(100, Math.round((passiveIncome / expenses) * 100));

// Візуальні індикатори
if (progressToFreedom >= 100) {
  showCelebrationEffects();
  unlockFastTrack();
}
```

---

## 🧮 Формули Розрахунків

### 💰 Cash Flow
```
cashFlow = (salary + passiveIncome) - expenses
```

### 📊 Прогрес до Свободи
```
freedomProgress = (passiveIncome / expenses) * 100
```

### 🏆 ROI (Return on Investment)
```
roi = (annualCashFlow / totalInvestment) * 100
```

### 💎 Net Worth
```
netWorth = assets - liabilities + cash
```

---

## 🎯 Перевірки Умов

### ✅ Перевірка Перемоги
```typescript
function checkVictory(player: Player): boolean {
  return player.finances.passiveIncome >= player.finances.expenses;
}
```

### ❌ Перевірка Банкрутства
```typescript
function checkBankruptcy(player: Player): boolean {
  return player.finances.cash < 0 && 
         (!player.finances.assets || player.finances.assets.length === 0);
}
```

### 🚀 Перевірка Доступу до Fast Track
```typescript
function canAccessFastTrack(player: Player): boolean {
  return checkVictory(player) && !player.isOnFastTrack;
}
```

---

## 🎪 Особливі Правила

### 🎲 Кубик
- **Dev Mode:** Миттєві кидки кнопками 1-6
- **Normal Mode:** Анімований кубик з випадковим результатом
- **Fast Track:** Додаткові бонуси при кидках

### 💬 Переговори
- Гравці можуть торгуватися між собою
- Обмін активами та грошима
- Спільні інвестиції

### 🏦 Кредити
- Можливість брати кредити під відсотки
- Впливають на щомісячні витрати
- Ризик дефолту

---

## 🔧 Технічна Реалізація

### 📦 Структура Даних
```typescript
interface Game {
  id: string;
  players: Player[];
  currentPlayer: string;
  state: GameState;
  board: Board[];
  market: MarketData;
}
```

### 🔄 Оновлення Стану
```typescript
function updateGameState(game: Game, action: GameAction): Game {
  // Валідація дії
  // Оновлення фінансів
  // Перевірка умов перемоги/програшу
  // Оповіщення гравців
  return updatedGame;
}
```

---

## 🎯 Використання в Коді

### Перевірка перемоги після кожного ходу:
```typescript
if (checkVictory(currentPlayer)) {
  showVictoryModal();
  gameState = GameState.FINISHED;
}
```

### Перевірка банкрутства:
```typescript
if (checkBankruptcy(currentPlayer)) {
  showBankruptcyModal();
  gameState = GameState.BANKRUPTCY;
}
```

### Оновлення UI:
```typescript
useEffect(() => {
  updateProgressIndicator();
  checkGameEndConditions();
}, [player.finances]);
```

---

## 📝 TODO для Реалізації

- [ ] Реалізувати модальні вікна перемоги/банкрутства
- [ ] Додати перевірки умов після кожного ходу
- [ ] Створити візуальні ефекти для перемоги
- [ ] Додати статистику гри
- [ ] Реалізувати перехід на Fast Track
- [ ] Додати анімації банкрутства

---

**🎮 Грайте, навчайтеся, досягайте фінансової свободи!**
