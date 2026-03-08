# ✅ ЗМІНИ ДЛЯ PRODUCTION DEPLOY

## 📝 Що було змінено (9 березня 2026)

### 🔧 Backend налаштування

#### 1. **Dynamic CORS для production**

`backend/cashflow-server-enhanced.js`:

```javascript
// ✅ РАНІШЕ (тільки localhost):
origin: ["http://localhost:5173", "http://localhost:5174"];

// ✅ ТЕПЕР (динамічно):
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL, "https://cashflow-ukraine.netlify.app"]
    : ["http://localhost:5173", "http://localhost:5174"];
```

#### 2. **Dynamic PORT з environment**

```javascript
// ✅ РАНІШЕ:
const PORT = 3001;

// ✅ ТЕПЕР:
const PORT = process.env.PORT || 3001;
```

#### 3. **Credentials включено**

```javascript
cors: {
  origin: allowedOrigins.filter(Boolean),
  credentials: true  // ✅ Додано
}
```

---

### 🎨 Frontend налаштування

#### 1. **Створено централізований config**

`frontend/src/config/api.ts` - **НОВИЙ ФАЙЛ**:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const config = {
  apiUrl: API_URL,
  socketUrl: SOCKET_URL,
  endpoints: {
    health: `${API_URL}/health`,
    createGame: `${API_URL}/api/games/create`,
    // ... інші endpoints
  },
};
```

#### 2. **Оновлено всі файли на config**

**Змінені файли:**

- ✅ `frontend/src/App.tsx` - імпортує config
- ✅ `frontend/src/components/GameLobby/GameLobby.tsx` - використовує config.endpoints
- ✅ `frontend/src/components/SimpleLobby/SimpleLobby.tsx` - використовує config.endpoints
- ✅ `frontend/src/services/socketService.ts` - використовує config.socketUrl

**До змін (❌ неправильно):**

```typescript
fetch("http://localhost:3001/api/games/create");
```

**Після змін (✅ правильно):**

```typescript
import config from "./config/api";
fetch(config.endpoints.createGame);
```

#### 3. **Оновлено .env файли**

`frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001  # ✅ Додано
```

`frontend/.env.example`:

```bash
# Додано коментарі для production
VITE_API_URL=http://localhost:3001
# For production: VITE_API_URL=https://your-backend.railway.app
```

---

### 📚 Документація

#### Створено нові файли:

1. **RAILWAY_DEPLOY_GUIDE.md** - детальний гайд деплою
   - Backend на Railway
   - Frontend на Netlify
   - Налаштування env vars
   - Troubleshooting

2. **DEPLOYMENT_FAQ.md** - швидкі відповіді
   - 5 кроків до деплою
   - Типові проблеми
   - Checklist готовності

3. **DEPLOYMENT_CHANGES.md** - цей файл
   - Список всіх змін
   - Причини змін
   - Інструкції використання

---

## 🎯 Чому це важливо?

### ❌ Проблема раніше:

- Hardcoded `localhost:3001` в 10+ місцях
- Неможливо деплоїти на production
- CORS не працював би з іншими доменами

### ✅ Рішення тепер:

- Одне джерело істини: `config/api.ts`
- Environment variables для різних середовищ
- Dynamic CORS на backend
- Готовність до Railway/Netlify deploy

---

## 🚀 Як використовувати

### Локальна розробка (БЕЗ ЗМІН):

```bash
./start-dev.sh
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

`.env` файл frontend автоматично використовує localhost.

---

### Production deploy:

**1. Backend на Railway:**

```
Environment Variables:
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
```

**2. Frontend на Netlify:**

```
Environment Variables:
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

**3. Build frontend:**

```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## 📊 Структура змін

```
Проект
│
├── backend/
│   ├── cashflow-server-enhanced.js  ✏️ ЗМІНЕНО (CORS + PORT)
│   └── .env.example                 ✏️ ОНОВЛЕНО
│
├── frontend/
│   ├── .env                         ✏️ ОНОВЛЕНО
│   ├── .env.example                 ✏️ ОНОВЛЕНО
│   ├── src/
│   │   ├── config/
│   │   │   └── api.ts               ✨ НОВИЙ ФАЙЛ
│   │   ├── App.tsx                  ✏️ ЗМІНЕНО (імпорт config)
│   │   ├── components/
│   │   │   ├── GameLobby/
│   │   │   │   └── GameLobby.tsx    ✏️ ЗМІНЕНО (config endpoints)
│   │   │   └── SimpleLobby/
│   │   │       └── SimpleLobby.tsx  ✏️ ЗМІНЕНО (config endpoints)
│   │   └── services/
│   │       └── socketService.ts     ✏️ ЗМІНЕНО (config.socketUrl)
│
└── docs/
    ├── RAILWAY_DEPLOY_GUIDE.md      ✨ НОВИЙ
    ├── DEPLOYMENT_FAQ.md            ✨ НОВИЙ
    └── DEPLOYMENT_CHANGES.md        ✨ НОВИЙ (цей файл)
```

---

## ✅ Результат

- ✅ Код працює локально (перевірено)
- ✅ Код готовий до production deploy
- ✅ CORS буде працювати правильно
- ✅ Socket.IO підключиться автоматично
- ✅ Жодних hardcoded URLs
- ✅ Environment-aware конфігурація
- ✅ Детальна документація деплою

---

## 🧪 Тестування

**Локальне:**

```bash
# 1. Backend
curl http://localhost:3001/health
# {"status":"OK","timestamp":"..."}

# 2. API
curl -X POST http://localhost:3001/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"hostId":"test-123"}'
# {"success":true,"game":{...}}

# 3. Frontend
open http://localhost:5173
# Створити гру -> має працювати
```

**Production (після деплою):**

1. Відкрийте Netlify URL
2. Створіть тестову гру
3. Browser console без помилок CORS
4. Socket.IO підключено (зелений статус)

---

## 💡 Наступні кроки

**Для деплою:**

1. Читайте [DEPLOYMENT_FAQ.md](./DEPLOYMENT_FAQ.md) - швидкий старт
2. Детальніше: [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md)

**Для розробки:**

- Продовжуйте використовувати `./start-dev.sh`
- Всі зміни автоматично працюють локально
- При додаванні нових API endpoints - додавайте в `config/api.ts`

---

**Створено:** 9 березня 2026  
**Статус:** ✅ Готово до деплою
