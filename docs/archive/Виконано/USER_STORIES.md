# 🎯 User Stories & Technical Tasks

## 📖 USER STORIES

### 🎮 Епік: Початок гри (Game Initiation)

#### Story 1: Створення гри
**Як організатор,**  
**я хочу створити нову гру,**  
**щоб запросити друзів пограти разом.**

**Acceptance Criteria:**
- ✅ Я можу натиснути "Створити гру" на головній сторінці
- ✅ Система генерує унікальний 6-символьний код гри
- ✅ Я автоматично стаю хостом гри
- ✅ Я потрапляю в лобі гри з кодом для запрошення

**Status:** ✅ COMPLETED

---

#### Story 2: Приєднання до гри
**Як гравець,**  
**я хочу приєднатися до гри за кодом,**  
**щоб грати з друзями.**

**Acceptance Criteria:**
- [ ] Я можу ввести 6-символьний код гри
- [ ] Я можу ввести своє ім'я (2-20 символів)
- [ ] Система перевіряє чи існує гра та чи є місця
- [ ] При успіху я потрапляю в лобі гри
- [ ] При помилці я бачу зрозуміле повідомлення

**Technical Tasks:**
```typescript
// Frontend Component
- [ ] JoinGameForm.tsx компонент
- [ ] Валідація інпутів (game code, player name)
- [ ] Error handling та user feedback
- [ ] Integration з gameStore

// Backend API
- [ ] POST /api/games/:gameId/join endpoint
- [ ] Validation middleware
- [ ] In-memory storage update операції
- [ ] Error responses

// Socket.IO
- [ ] join-game event handler
- [ ] player-joined broadcast
- [ ] Error event handling
```

**Priority:** P0 | **Estimate:** 2 дні

---

#### Story 3: Вибір професії
**Як гравець,**  
**я хочу вибрати професію свого персонажа,**  
**щоб почати гру з відповідними фінансовими параметрами.**

**Acceptance Criteria:**
- [ ] Я бачу список доступних професій
- [ ] Кожна професія показує базову зарплату
- [ ] Я можу вибрати одну професію
- [ ] Інші гравці бачать мій вибір
- [ ] Я можу змінити професію до початку гри

**Technical Tasks:**
```typescript
// Profession Data
- [ ] Profession interface та константи
- [ ] Початкові дані професій (4-6 варіантів)
- [ ] Фінансові параметри для кожної професії

// UI Component
- [ ] ProfessionSelector.tsx
- [ ] Modal або dropdown з професіями
- [ ] Відображення параметрів професії

// Backend
- [ ] Збереження вибору професії в Game model
- [ ] Валідація професії
- [ ] Update через Socket.IO
```

**Priority:** P0 | **Estimate:** 1 день

---

### 🎪 Епік: Лобі гри (Game Lobby)

#### Story 4: Перегляд гравців у лобі
**Як гравець у лобі,**  
**я хочу бачити всіх підключених гравців,**  
**щоб знати хто грає та їх готовність.**

**Acceptance Criteria:**
- [ ] Я бачу список всіх гравців в грі
- [ ] Для кожного гравця показано: ім'я, професію, статус готовності
- [ ] Я бачу хто є хостом гри
- [ ] Список оновлюється в реальному часі
- [ ] Показується скільки гравців з максимуму

**Technical Tasks:**
```typescript
// UI Components
- [ ] GameLobby.tsx головний компонент
- [ ] PlayerList.tsx список гравців  
- [ ] PlayerCard.tsx картка гравця
- [ ] Host indicators та badges

// State Management
- [ ] Lobby state в gameStore
- [ ] Real-time updates через Socket.IO
- [ ] Player list synchronization

// Socket Events
- [ ] player-joined handler
- [ ] player-left handler
- [ ] player-updated handler
```

**Priority:** P0 | **Estimate:** 1 день

---

#### Story 5: Готовність до гри
**Як гравець,**  
**я хочу позначити що готовий до початку гри,**  
**щоб хост знав коли можна починати.**

**Acceptance Criteria:**
- [ ] Я можу поставити/зняти галочку "Готовий"
- [ ] Всі гравці бачать мій статус готовності
- [ ] Я не можу змінювати професію після позначення готовності
- [ ] Показується скільки гравців готові

**Technical Tasks:**
```typescript
// UI
- [ ] Ready checkbox/button компонент
- [ ] Visual indicators для ready/not ready
- [ ] Disabled states для UI елементів

// Backend
- [ ] isReady поле в Player model
- [ ] Socket event player-ready-toggle
- [ ] Broadcast ready status changes

// Game Logic
- [ ] Check all players ready logic
- [ ] Prevent game settings changes when ready
```

**Priority:** P0 | **Estimate:** 0.5 дня

---

#### Story 6: Початок гри (Хост)
**Як хост гри,**  
**я хочу почати гру коли всі готові,**  
**щоб перейти до ігрового процесу.**

**Acceptance Criteria:**
- [ ] Кнопка "Почати гру" доступна тільки мені (хосту)
- [ ] Кнопка активна тільки коли всі гравці готові
- [ ] При натисканні всі гравці переходять в ігровий режим
- [ ] Нові гравці не можуть приєднатися до розпочатої гри

**Technical Tasks:**
```typescript
// UI
- [ ] StartGameButton.tsx компонент
- [ ] Conditional rendering для хоста
- [ ] Disabled state коли не всі готові
- [ ] Loading state під час старту

// Game State
- [ ] Transition з 'waiting' на 'in-progress'
- [ ] Initialize game board state
- [ ] Set starting positions та finances
- [ ] Prevent new joins після старту

// Socket.IO
- [ ] start-game event
- [ ] game-started broadcast
- [ ] Redirect всіх на game screen
```

**Priority:** P0 | **Estimate:** 1 день

---

### 🎲 Епік: Базова ігрова механіка (Core Gameplay)

#### Story 7: Ігрова дошка
**Як гравець у грі,**  
**я хочу бачити ігрову дошку з позиціями всіх гравців,**  
**щоб розуміти поточний стан гри.**

**Acceptance Criteria:**
- [ ] Я бачу круглу дошку з клітинками Rat Race
- [ ] Показані позиції всіх гравців на дошці
- [ ] Кожен гравець має унікальний кольор/аватар
- [ ] Підписані ключові клітинки (Payday, Opportunity, тощо)
- [ ] Відображається Fast Track для тих хто туди потрапив

**Priority:** P1 | **Estimate:** 2 дні

---

#### Story 8: Кидання кубика
**Як гравець у свій хід,**  
**я хочу кинути кубик щоб рухатися по дошці,**  
**щоб прогресувати в грі.**

**Acceptance Criteria:**
- [ ] Я можу кинути кубик тільки у свій хід
- [ ] Показується 3D анімація кидання кубика
- [ ] Результат синхронізується між всіма гравцями
- [ ] Мій персонаж автоматично рухається на випале число
- [ ] Хід переходить до наступного гравця

**Priority:** P1 | **Estimate:** 2 дні

---

### 💰 Епік: Фінансова система (Financial System)

#### Story 9: Фінансова панель
**Як гравець,**  
**я хочу бачити свої фінансові показники,**  
**щоб приймати обґрунтовані рішення.**

**Acceptance Criteria:**
- [ ] Панель показує поточні гроші (Cash)
- [ ] Показує пасивний дохід (Passive Income)
- [ ] Показує витрати (Total Expenses)
- [ ] Показує грошовий потік (Cashflow = Income - Expenses)
- [ ] Показує прогрес до Fast Track

**Priority:** P1 | **Estimate:** 1 день

---

### 🤝 Епік: Система угод (Deal System)

#### Story 10: Перегляд угод
**Як гравець,**  
**я хочу бачити доступні інвестиційні угоди,**  
**щоб збільшити свій пасивний дохід.**

**Acceptance Criteria:**
- [ ] Панель показує поточні доступні угоди
- [ ] Для кожної угоди видно: назву, вартість, дохід
- [ ] Я можу розрахувати рентабельність угоди
- [ ] Показується чи у мене достатньо грошей
- [ ] Угоди з'являються випадково або по клітинках

**Priority:** P2 | **Estimate:** 2 дні

---

#### Story 11: Переговори між гравцями
**Як гравець,**  
**я хочу торгуватися з іншими гравцями,**  
**щоб разом інвестувати у великі угоди.**

**Acceptance Criteria:**
- [ ] Я можу запропонувати угоду іншому гравцю
- [ ] Можу встановити свою частку інвестиції
- [ ] Інший гравець може прийняти/відхилити/запропонувати зміни
- [ ] Угода виконується автоматично при згоді
- [ ] Дохід розподіляється пропорційно вкладам

**Priority:** P2 | **Estimate:** 3 дні

---

## 🛠 ТЕХНІЧНІ ЗАДАЧІ

### Database Schema Updates
```typescript
// Player model updates
interface Player {
  // ...existing fields
  profession: {
    name: string;
    salary: number;
    expenses: number;
  };
  isReady: boolean;
  position: number; // board position
  finances: {
    cash: number;
    passiveIncome: number;
    totalExpenses: number;
  };
  deals: Deal[];
}

// Game model updates  
interface Game {
  // ...existing fields
  currentPlayerIndex: number;
  boardState: {
    availableDeals: Deal[];
    diceResult: number | null;
  };
}
```

### Socket.IO Events Architecture
```typescript
// Game Events
interface GameEvents {
  // Lobby events
  'join-game': (data: { gameId: string; playerName: string }) => void;
  'player-joined': (player: Player) => void;
  'player-ready-toggle': (playerId: string) => void;
  'player-updated': (player: Player) => void;
  'start-game': () => void;
  'game-started': (gameState: Game) => void;
  
  // Gameplay events
  'roll-dice': () => void;
  'dice-rolled': (result: number, playerId: string) => void;
  'player-moved': (playerId: string, position: number) => void;
  'turn-changed': (currentPlayerId: string) => void;
  
  // Deal events
  'propose-deal': (deal: DealProposal) => void;
  'deal-response': (response: DealResponse) => void;
  'deal-completed': (deal: CompletedDeal) => void;
}
```

### Component Architecture
```
src/
├── components/
│   ├── Lobby/
│   │   ├── GameLobby.tsx
│   │   ├── PlayerList.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── ProfessionSelector.tsx
│   │   └── StartGameButton.tsx
│   ├── Game/
│   │   ├── GameBoard.tsx
│   │   ├── DiceRoller.tsx
│   │   ├── PlayerPosition.tsx
│   │   └── TurnIndicator.tsx
│   ├── Finance/
│   │   ├── FinancePanel.tsx
│   │   ├── CashflowDisplay.tsx
│   │   └── ExpenseTracker.tsx
│   └── Deals/
│       ├── DealsPanel.tsx
│       ├── DealCard.tsx
│       ├── NegotiationModal.tsx
│       └── DealHistory.tsx
```

---

## 📊 STORY POINTS & ESTIMATES

### Sprint 1 (7-14 червня) - Total: 13 SP
- Story 2: Приєднання до гри - **5 SP**
- Story 3: Вибір професії - **3 SP**  
- Story 4: Перегляд гравців - **3 SP**
- Story 5: Готовність до гри - **1 SP**
- Story 6: Початок гри - **3 SP**

### Sprint 2 (15-21 червня) - Total: 13 SP  
- Story 7: Ігрова дошка - **5 SP**
- Story 8: Кидання кубика - **5 SP**
- Story 9: Фінансова панель - **3 SP**

### Sprint 3 (22-28 червня) - Total: 13 SP
- Story 10: Перегляд угод - **5 SP**
- Story 11: Переговори - **8 SP**

---

*Документ створено: 7 червня 2025*  
*Останнє оновлення: 7 червня 2025*
