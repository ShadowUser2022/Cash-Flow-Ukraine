# ⚠️ Railway: Root Directory має бути порожнім

Backend потребує папку **`shared/`** (типи та константи гри). Вона знаходиться в **корені** репо, не в `backend/`.

## Що зробити в Railway Dashboard

1. Відкрийте проєкт **Cash-Flow-Ukraine** (backend service).
2. **Settings** → **Root Directory**.
3. **Очистіть поле** (залиште порожнім) або вкажіть `.`
4. Збережіть. Railway перезапустить деплой.

Після цього Railway використовуватиме **кореневий** `Dockerfile` і `railway.json`, які копіюють і `backend/`, і `shared/` в образ — помилка `Cannot find module '../../../shared/constants/game'` зникне.

Якщо Root Directory = `backend`, в образ потрапляє лише вміст `backend/`, тому `shared/` недоступний і сервер падає при старті.
