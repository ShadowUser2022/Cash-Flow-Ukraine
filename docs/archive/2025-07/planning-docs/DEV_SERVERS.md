# Development Server Configuration

## 🎯 Фіксовані порти (Fixed Ports)

Проект налаштований для роботи на фіксованих портах без пошуку альтернативних:

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (Express server)

## 🚀 Швидкий старт

### Опція 1: Bash скрипти
```bash
# Запуск всіх серверів
./start-dev.sh

# Зупинка всіх серверів  
./stop-dev.sh
```

### Опція 2: VS Code Tasks
- `⚡ Quick Start (Fixed Ports)` - запустити все
- `🛑 Stop All Servers` - зупинити все
- `🔄 Restart Frontend Only` - перезапуск тільки фронтенду

### Опція 3: Окремо
```bash
# Backend
cd backend && node cashflow-server-enhanced.js

# Frontend (з форсованим портом)
cd frontend && npm run dev:force
```

## ⚙️ Конфігурація

### Frontend (Vite)
- `vite.config.ts`: `strictPort: true` - не шукати інші порти
- `package.json`: `dev:force` скрипт з автоматичним вбивством процесу на порту

### Backend
- Фіксований порт 3001 в `cashflow-server-enhanced.js`

## 🔧 Автоматична очистка портів

При запуску автоматично вбиваються процеси на портах:
- 5173 (frontend)
- 3001 (backend)

Це забезпечує чистий старт без конфліктів портів.

## 🐛 Troubleshooting

Якщо сервер не запускається:
```bash
# Ручна очистка портів
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Або використати скрипт
./stop-dev.sh
```

## 📝 VS Code Tasks

Доступні таски в Command Palette (Cmd+Shift+P -> "Tasks: Run Task"):
- 🚀 Start Backend Server
- 🎨 Start Frontend Dev  
- ⚡ Quick Start (Fixed Ports)
- 🔄 Restart Frontend Only
- 🛑 Stop All Servers
- 🧪 Test Backend API
