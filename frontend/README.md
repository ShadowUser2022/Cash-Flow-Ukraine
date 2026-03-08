# 🎮 Cash Flow Ukraine - Frontend Application

**React + TypeScript + Vite мультиплеєрна онлайн-гра**

Фронтенд додаток для освітньої фінансової гри Cash Flow Ukraine, заснованої на настільній грі Роберта Кійосакі.

## 🚀 Швидкий старт

```bash
# Встановлення залежностей
npm install

# Запуск в режимі розробки
npm run dev
# ✅ Додаток буде доступний на http://localhost:5173

# Збірка для продакшену
npm run build

# Попередній перегляд продакшен збірки
npm run preview
```

## 🛠️ Технологічний стек

- **React 18** - UI бібліотека
- **TypeScript** - типобезпека
- **Vite** - швидка збірка та розробка
- **Zustand** - state management
- **Socket.IO Client** - real-time з'єднання з сервером
- **WebRTC** - відео чат між гравцями

## 📁 Структура проекту

```
src/
├── components/           # React компоненти
│   ├── GameBoard/       # Ігрове поле
│   ├── GameLobby/       # Лобі гри
│   ├── VideoChat/       # Відео чат
│   ├── PlayerPanel/     # Панель гравця
│   ├── DealsPanel/      # Панель угод
│   └── Chat/            # Текстовий чат
├── services/            # API та Socket.IO сервіси
├── store/               # Zustand store
├── hooks/               # Custom React hooks  
├── types/               # TypeScript типи
├── utils/               # Утиліти та допомагачі
└── constants/           # Константи додатку
```

## 🔧 Налаштування розробки

### Підключення до backend
Backend сервер повинен працювати на `http://localhost:3001`

```bash
# В папці backend
node cashflow-server-enhanced.js
```

### Технічні плагіни Vite

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### ESLint конфігурація для продакшену

Якщо ви розробляєте продакшн додаток, рекомендуємо оновити конфігурацію для увімкнення type-aware правил:

```js
export default tseslint.config({
  extends: [
    // Замініть ...tseslint.configs.recommended на це:
    ...tseslint.configs.recommendedTypeChecked,
    // Або використайте це для більш строгих правил:
    ...tseslint.configs.strictTypeChecked,
    // Опціонально, додайте стилістичні правила:
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // інші опції...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

Ви також можете встановити [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) та [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) для React-специфічних правил.

## 🎮 Ігрові компоненти

### GameLobby
Лобі для створення та приєднання до ігор:
- Створення нової гри
- Приєднання до існуючої гри за ID
- Вибір професії гравця
- Очікування інших гравців

### GameBoard  
Головне ігрове поле:
- Візуалізація кільця гри (Щурячі перегони та Швидка доріжка)
- Позиції гравців на полі
- Відображення поточного ходу

### PlayerPanel
Панель інформації про гравця:
- Фінансовий стан (доходи, витрати, активи)
- Професія та цілі
- Кнопки ігрових дій

### DealsPanel
Панель угод та інвестицій:
- Карти малих та великих угод
- Ринкові події та дрібнички
- Управління портфелем

## 📱 Responsive дизайн

Додаток оптимізований для:
- 🖥️ Десктоп (1920x1080+)
- 💻 Ноутбук (1366x768+)  
- 📱 Мобільні пристрої (768px+)

## 🔗 Документація проекту

- **[📚 Центральна документація](../docs/README.md)**
- **[🎯 API Reference](../docs/api/REST-API.md)**
- **[🏗️ Технічна архітектура](../docs/technical/TECHNICAL_ARCHITECTURE.md)**
- **[👨‍💻 Інструкції тестування](../docs/user-guides/STEP_BY_STEP_FRONTEND_TEST.md)**
    ...reactDom.configs.recommended.rules,
  },
})
```
