# 🚀 ШВИДКИЙ ГАЙД: GIT COMMIT + RAILWAY DEPLOY

## 📝 Крок 1: Commit змін

### 1.1 Додати всі зміни:
```bash
git add .
```

### 1.2 Зробити commit:
```bash
git commit -m "✅ Виправлено фінансову систему + готовність до Railway deploy

- Виправлено синхронізацію updatePlayerCash() з gameStore
- Додано emitGameState() для real-time оновлень
- Виправлено Socket.IO room consistency
- Додано dynamic CORS та PORT для production
- Створено централізований config/api.ts
- Оновлено всі компоненти для використання env vars
- Готово до deploy на Railway + Netlify"
```

### 1.3 Push на GitHub:
```bash
git push origin main
```

---

## 🚂 Крок 2: Deploy на Railway

### Варіант A: Через Railway Dashboard (рекомендовано)

#### 1️⃣ Створити проект Backend:

1. Зайти на https://railway.app/dashboard
2. Натиснути **"New Project"**
3. Вибрати **"Deploy from GitHub repo"**
4. Авторизувати Railway доступ до GitHub (якщо ще не зроблено)
5. Вибрати репозиторій: **"Cash Flow Ukr"**

#### 2️⃣ Налаштування Backend:

**Settings → Service Settings:**
- **Root Directory:** `backend`
- **Builder:** Nixpacks (автоматично)
- **Start Command:** `npm start` (Railway візьме з package.json)

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend.netlify.app
```

⚠️ **ВАЖЛИВО:** `PORT` Railway встановить автоматично, але ми маємо fallback в коді.

#### 3️⃣ Deploy Backend:

- Railway автоматично почне build після налаштування
- Чекайте 2-3 хвилини
- Отримаєте URL: `https://your-backend-xxx.railway.app`

#### 4️⃣ Перевірка Backend:

```bash
curl https://your-backend.railway.app/health
# → {"status":"OK","timestamp":"..."}
```

---

### Варіант B: Через Railway CLI

#### Встановити Railway CLI:
```bash
npm install -g @railway/cli
```

#### Логін:
```bash
railway login
```

#### Deploy Backend:
```bash
cd backend
railway init
railway up
```

---

## 🎨 Крок 3: Deploy Frontend на Netlify

### 1️⃣ Build локально (тест):
```bash
cd frontend
npm run build
```

### 2️⃣ Deploy на Netlify:

**Варіант A: Drag & Drop**
1. Зайти на https://app.netlify.com
2. Drag & drop папку `frontend/dist` на сайт

**Варіант B: З GitHub**
1. Netlify → **New site from Git**
2. Вибрати репозиторій
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`
5. **Base directory:** `frontend`

### 3️⃣ Env Variables в Netlify:

**Site settings → Environment variables:**
```
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

### 4️⃣ Rebuild:
Netlify → **Trigger deploy** або `git push` (auto-deploy)

---

## 🔄 Крок 4: Оновити Backend CORS

Після отримання Netlify URL:

**Railway → Backend Project → Environment Variables:**
```
FRONTEND_URL=https://your-actual-app.netlify.app
```

Railway автоматично перезапустить backend.

---

## 🧪 Крок 5: Тестування Production

### Backend Test:
```bash
curl https://your-backend.railway.app/health
curl https://your-backend.railway.app/api/games
```

### Frontend Test:
1. Відкрити `https://your-app.netlify.app`
2. Створити тестову гру
3. Перевірити browser console (без CORS помилок)
4. Перевірити Socket.IO підключення (зелений статус)

---

## ⚡ Auto-Deploy (налаштування)

### Railway Auto-Deploy:
✅ **Вже налаштовано** - кожен `git push` → automatic deploy

### Netlify Auto-Deploy:
✅ **Вже налаштовано** - кожен `git push` → automatic rebuild

### Як це працює:
```
git push origin main
    ↓
GitHub отримує зміни
    ↓
Railway → автоматичний rebuild backend (2-3 хв)
    ↓
Netlify → автоматичний rebuild frontend (1-2 хв)
    ↓
✅ Production оновлено!
```

---

## 📋 Швидкі команди для наступних deploy

### Щоразу після змін:

```bash
# 1. Commit
git add .
git commit -m "Опис змін"

# 2. Push (запускає auto-deploy)
git push origin main

# 3. Чекати 2-3 хвилини
# Railway та Netlify автоматично оновляться
```

---

## 🔗 Корисні посилання

### Railway:
- Dashboard: https://railway.app/dashboard
- Docs: https://docs.railway.app
- CLI: https://docs.railway.app/develop/cli

### Netlify:
- Dashboard: https://app.netlify.com
- Docs: https://docs.netlify.com
- CLI: https://docs.netlify.com/cli/get-started/

---

## 🆘 Troubleshooting

### Railway build fails:
```bash
railway logs
# Перевірити помилки компіляції
```

### CORS помилки:
Переконайтесь що `FRONTEND_URL` в Railway = Netlify URL (точно!)

### Socket.IO не підключається:
1. Перевірити `VITE_SOCKET_URL` в Netlify
2. Перебудувати frontend після зміни env vars
3. Перевірити browser console

---

## ✅ Готово!

Після всіх кроків матимете:

- 🚂 **Backend:** `https://your-backend.railway.app`
- 🎨 **Frontend:** `https://your-app.netlify.app`
- 🔄 **Auto-deploy:** працює на обох платформах
- 📊 **Monitoring:** доступний в Railway/Netlify dashboards

---

**Наступні deploy:** просто `git push` - все оновиться автоматично! 🎉
