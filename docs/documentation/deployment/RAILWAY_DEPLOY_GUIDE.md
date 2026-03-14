# 🚀 Деплой Cash Flow Ukraine на Railway

## 📋 Передумови

1. Акаунт на [Railway.app](https://railway.app)
2. GitHub репозиторій з проектом
3. Railway CLI (опціонально)

---

## 🎯 Крок 1: Підготовка Backend

### 1.1 Перевірте файли

✅ Файли для деплою backend (деплой з **кореня** репо):

- `railway.json` (корінь) — builder: DOCKERFILE, startCommand для backend
- `Dockerfile` (корінь) — копіює `backend/` та `shared/`
- `backend/package.json` - є
- `backend/cashflow-server-enhanced.js` - оновлено для production

### 1.2 Створіть проект на Railway

1. Зайдіть на [Railway Dashboard](https://railway.app/dashboard)
2. Натисніть **"New Project"**
3. Виберіть **"Deploy from GitHub repo"**
4. Виберіть ваш репозиторій `Cash Flow Ukr`
5. Railway автоматично знайде **кореневий** Dockerfile (не вказуйте Root Directory = `backend` — тоді не буде доступу до `shared/`)

### 1.3 Налаштуйте змінні оточення

У Railway Dashboard → Environment Variables додайте:

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.netlify.app
```

⚠️ **ВАЖЛИВО**: `PORT` Railway встановить автоматично, але ми маємо fallback.

### 1.4 Root Directory

Railway → Settings → **Root Directory**: залишити **порожнім** (корінь репо). У корені є `railway.json` і `Dockerfile`, які копіюють `backend/` та `shared/` — це потрібно для роботи backend.

### 1.5 Deploy!

Натисніть **"Deploy"** і чекайте ~2-3 хвилини.

---

## 🎨 Крок 2: Підготовка Frontend

### 2.1 Встановіть Netlify CLI (опціонально)

```bash
npm install -g netlify-cli
```

### 2.2 Build локально (тест)

```bash
cd frontend
npm run build
```

Перевірте що `dist/` створилась без помилок.

### 2.3 Деплой на Netlify

**Варіант A: Через Netlify UI (рекомендовано)**

1. Зайдіть на [Netlify](https://app.netlify.com)
2. Drag & Drop папку `frontend/dist` на Netlify
3. Або підключіть GitHub repo

**Варіант B: Через Netlify CLI**

```bash
cd frontend
netlify deploy --prod
```

### 2.4 Налаштуйте змінні оточення в Netlify

Netlify Dashboard → Site settings → Environment variables:

```
VITE_API_URL=https://your-backend-url.railway.app
VITE_SOCKET_URL=https://your-backend-url.railway.app
```

### 2.5 Перебудуйте frontend з правильними змінними

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## 🔄 Крок 3: Фінальна конфігурація

### 3.1 Оновіть CORS на Backend

Повернутись до Railway → Backend project → Environment Variables:

```
FRONTEND_URL=https://your-actual-frontend.netlify.app
```

Це забезпечить правильні CORS налаштування.

### 3.2 Перезапустіть Backend

Railway автоматично перезапустить при зміні env vars.

### 3.3 Тестування

1. Відкрийте frontend URL: `https://your-app.netlify.app`
2. Спробуйте створити гру
3. Перевірте browser console на помилки CORS
4. Перевірте Socket.IO підключення

---

## ✅ Checklist Deploy

- [ ] Backend деплоїться на Railway
- [ ] Backend health endpoint працює: `https://your-backend.railway.app/health`
- [ ] Frontend збудовано з правильними env vars
- [ ] Frontend деплоїться на Netlify
- [ ] CORS налаштовано правильно (frontend URL в backend env)
- [ ] Socket.IO підключається успішно
- [ ] Тестова гра створюється та працює

---

## 🐛 Troubleshooting

### Backend не запускається

```bash
# Перевірте логи Railway
railway logs
```

### CORS помилки

Переконайтесь що `FRONTEND_URL` в Railway точно співпадає з Netlify URL (без trailing slash).

### Socket.IO не підключається

1. Перевірте що `VITE_SOCKET_URL` в Netlify правильний
2. Перевірте browser console: `Failed to connect to socket`
3. Логи backend на Railway повинні показувати `Socket.IO client connected`

### Frontend показує blank page

```bash
# Перевірте build
cd frontend
npm run build
# Перевірте dist/index.html
```

---

## 📱 Railway Custom Domain (опціонально)

1. Railway → Settings → Domains
2. Додайте custom domain: `api.cashflow-ukraine.com`
3. Налаштуйте DNS records згідно інструкцій Railway

---

## 🔐 Безпека для Production

### Додайте до backend:

1. **Rate limiting**
2. **Helmet.js** для HTTP headers
3. **JWT authentication** (майбутнє)
4. **HTTPS only**

```bash
npm install helmet express-rate-limit
```

---

## 📊 Моніторинг

Railway Dashboard показує:

- CPU usage
- Memory usage
- Network traffic
- Logs в реальному часі

---

**Готово!** 🎉 Ваш проект тепер live на Railway + Netlify!

**Frontend**: `https://your-app.netlify.app`  
**Backend**: `https://your-backend.railway.app`
