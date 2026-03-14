# 🚀 ШВИДКИЙ СТАРТ - Deployment FAQ

## ❓ Що потрібно для деплою?

1. **GitHub** репозиторій з кодом
2. **Railway** акаунт (безкоштовний для старту)
3. **Netlify** акаунт (безкоштовний)
4. 15-20 хвилин часу

---

## 🎯 Коротка інструкція (5 кроків)

### 1️⃣ Backend на Railway

```bash
1. Railway.app → New Project → Deploy from GitHub
2. Виберіть repo "Cash Flow Ukr"
3. Root Directory: "backend"
4. Додайте env var: FRONTEND_URL=https://your-app.netlify.app
5. Deploy! (автоматично)
```

**Результат**: `https://your-backend.railway.app`

---

### 2️⃣ Frontend на Netlify

```bash
cd frontend
npm run build
# Drag & drop dist/ на netlify.com
```

**Або через GitHub:**

```
Netlify → New site from Git → Choose repo
Build command: npm run build
Publish directory: dist
```

---

### 3️⃣ Налаштування Frontend env vars в Netlify

```
Site settings → Environment variables:
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
```

Потім: **Trigger deploy**

---

### 4️⃣ Оновіть Backend CORS

Railway → Backend → Environment:

```
FRONTEND_URL=https://your-actual-app.netlify.app
```

---

### 5️⃣ Тест

Відкрийте `https://your-app.netlify.app` і створіть тестову гру!

---

## 🐛 Типові проблеми

### ❌ "CORS policy" помилка

**Причина**: Backend не дозволяє запити з frontend URL

**Рішення**:

1. Перевірте `FRONTEND_URL` в Railway env vars
2. URL має бути точним: `https://app.netlify.app` (без `/` в кінці)
3. Перезапустіть backend після зміни

---

### ❌ "Failed to connect to socket"

**Причина**: Socket.IO не може підключитись до backend

**Рішення**:

1. Netlify env vars: `VITE_SOCKET_URL` правильний?
2. Перебудуйте frontend після зміни env vars
3. Перевірте browser console: який URL використовується?

---

### ❌ Backend crashes на Railway

**Причина**: Помилка в коді або відсутні залежності

**Рішення**:

1. Railway → View Logs
2. Знайдіть stop error
3. Часто: `npm install` не виконався правильно
4. Dockerfile = `RUN npm install` має бути

---

### ❌ Frontend показує "Cannot GET /api/games"

**Причина**: Frontend робить запити не туди

**Рішення**:

1. Netlify env vars встановлені?
2. Frontend перебудовано після встановлення env vars?
3. Browser console → Network tab → перевірте URL запиту

---

## 📋 Checklist перед deployment

**Backend готовий:**

- [ ] `Dockerfile` є
- [ ] `railway.json` налаштовано
- [ ] Код використовує `process.env.PORT`
- [ ] CORS налаштовано динамічно
- [ ] Health endpoint працює локально

**Frontend готовий:**

- [ ] `.env.example` документовано
- [ ] Код використовує `import.meta.env.VITE_API_URL`
- [ ] `npm run build` працює без помилок
- [ ] `dist/` створюється правильно
- [ ] axios/fetch використовують config змінні

---

## 🔑 Ключові файли

**Backend:**

- `backend/Dockerfile` - Docker збірка
- `backend/railway.json` - Railway конфіг
- `backend/cashflow-server-enhanced.js` - entry point

**Frontend:**

- `frontend/.env.example` - шаблон env vars
- `frontend/src/config/api.ts` - централізовані URL
- `frontend/vite.config.ts` - Vite конфіг

---

## 💡 Поради

1. **Локальне тестування спочатку!**

   ```bash
   ./start-dev.sh
   # Перевірте http://localhost:5173
   ```

2. **Env vars критичні!**
   - Без них frontend не знає де backend
   - Завжди перебудовуйте після зміни env vars

3. **Логи - ваш друг**
   - Railway: View Logs
   - Netlify: Functions → Logs
   - Browser: Console + Network tab

4. **Free tier limits**
   - Railway: 500 годин/місяць безкоштовно
   - Netlify: 100GB bandwidth безкоштовно
   - Цього вистачить для тестування!

---

## 🚀 Production готовність

**Додайте пізніше:**

- [ ] Custom domain
- [ ] SSL certificates (Railway/Netlify автоматично)
- [ ] Database (MongoDB Atlas)
- [ ] Authentication (JWT)
- [ ] Monitoring (Railway metrics)
- [ ] Error tracking (Sentry)

---

## 📞 Допомога

**Документація:**

- Railway: https://docs.railway.app
- Netlify: https://docs.netlify.com
- Vite env vars: https://vitejs.dev/guide/env-and-mode.html

**Детальний гайд:** [RAILWAY_DEPLOY_GUIDE.md](./RAILWAY_DEPLOY_GUIDE.md)

---

**Успіхів! 🎉**
