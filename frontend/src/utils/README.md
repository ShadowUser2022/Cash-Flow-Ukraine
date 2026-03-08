# 🔍 Система логування Cashflow Online

## Огляд

Ця система логування створена для відладки та моніторингу дій гравців під час розробки гри. Вона може бути легко увімкнена/вимкнена і надає структуровані логи для різних типів подій.

## Використання

### Основні функції

```typescript
import { log, logDiceRoll, logPlayerAction, logGameAction } from './utils/logger';

// Основне логування
log('Повідомлення', { data: 'value' }, 'info');

// Логування кидання кубика
logDiceRoll('PlayerName', 'game-123', 6, 1);

// Логування дій гравця
logPlayerAction('PlayerName', 'JOIN_GAME', { gameId: 'game-123' });

// Логування дій гри
logGameAction({
  type: 'CREATE_GAME',
  player: 'PlayerName',
  gameId: 'game-123',
  data: { action: 'create_new_game' }
});
```

### Налаштування

У файлі `logger.ts` можна змінити:
- `LOGGING_CONFIG.enabled` - увімкнути/вимкнути логування
- `LOGGING_CONFIG.prefix` - змінити префікс логів
- `LOGGING_CONFIG.colors` - налаштувати кольори для різних типів логів

### Швидке вимкнення

```typescript
import { disableLogging, enableLogging } from './utils/logger';

disableLogging(); // Вимкнути всі логи
enableLogging();  // Увімкнути логи знову
```

## Типи логів

1. **info** (🔵) - Загальна інформація
2. **success** (🟢) - Успішні операції  
3. **warning** (🟡) - Попередження
4. **error** (🔴) - Помилки
5. **dice** (🟣) - Кидання кубика

## Приклад виводу

```
[CASHFLOW] Кидання кубика #1
  ⏰ Час: 2025-06-08T10:30:45.123Z
  📊 Дані: {
    player: "Толік",
    gameId: "game-1717840245123",
    result: 4,
    rollCount: 1,
    emoji: "🎲"
  }
```

## Поточна реалізація

✅ Логування створення/приєднання до гри  
✅ Логування кидання кубика з результатом  
✅ Логування виходу з гри  
✅ Лічильник кидань кубика  
✅ Структуровані дані в консолі  

## Майбутні покращення

🔄 Збереження логів у localStorage  
🔄 Експорт логів до файлу  
🔄 Фільтрація логів за типом  
🔄 Відправка логів на сервер для аналітики
