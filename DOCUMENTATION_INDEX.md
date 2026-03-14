# 📚 Документація проекту — Мастер-індекс

Цей файл — **єдине джерело правди** для швидкого орієнтування в документації Cash Flow Ukraine.
Він показує **де лежить** кожен документ, **що в ньому описано**, **який статус** (активний / зроблено / архів) та **що важливо читати в першу чергу**.

---

## 🧭 Як використовувати цей файл

1. **Починай з розділу "Головні документи"** — саме вони визначають правила та загальний план.
2. Якщо тобі потрібно знайти конкретну ділянку (архітектура, правила, тестування) — переходь в розділ "Категорії".
3. Всі документації, що вже **виконані**, переміщено в папку `docs/archive/Виконано/`.

---

## ✅ Головні документи (читати першими)

| Документ                   | Опис                                         | Статус     | Розташування                                     |
| -------------------------- | -------------------------------------------- | ---------- | ------------------------------------------------ |
| **Roadmap (MASTER)**       | Єдиний roadmap проекту (стан + план)         | **ACTIVE** | `docs/project-management/ROADMAP.md`             |
| **Development Strategy**   | Стратегія, правила, механіки, стандарти      | **ACTIVE** | `docs/documentation/DEVELOPMENT_STRATEGY.md`     |
| **Game Rules & Mechanics** | Повні правила гри (Cashflow)                 | **ACTIVE** | `docs/documentation/GAME_RULES_AND_MECHANICS.md` |
| **Developer Checklist**    | Процедури розробки та стандарти (Pre-commit) | **ACTIVE** | `docs/documentation/DEVELOPER_CHECKLIST.md`      |
| **Quick Reference**        | Швидке меню та команди                       | **ACTIVE** | `docs/documentation/QUICK_REFERENCE.md`          |

---

## 📁 Структура документів (ієрархія)

### 1) Основна документація (root)

| Файл        | Опис                             | Статус |
| ----------- | -------------------------------- | ------ |
| `README.md` | Огляд репозиторію + як запустити | ACTIVE |

### 2) Документація (docs/documentation/)

#### 2.1 `docs/documentation/project/`

- **MAIN.md** — Загальний опис системи, архітектури, юзерсторі
- **PROJECT_GUIDE.md** — Навігація по проекту, процедурні рекомендації

#### 2.2 `docs/documentation/process/`

- **DEVELOPMENT_STRATEGY.md** — Стратегія, правила, механіки, стандарти
- **DEVELOPER_CHECKLIST.md** — Процедури розробки та стандарти
- **QUICK_REFERENCE.md** — Швидке меню та команди

#### 2.3 `docs/documentation/deployment/`

- **DEPLOYMENT_README.md** — Як розгортати (Docker/демо)
- **DEPLOYMENT_CHANGES.md** — Історія змін при розгортанні
- **DEPLOYMENT_FAQ.md** — Часті питання з розгортки
- **RAILWAY_DEPLOY_GUIDE.md** — Розгортання на Railway
- **RAILWAY_QUICKSTART.md** — Швидкий старт на Railway

#### 2.4 `docs/documentation/finance/`

- **FINANCIAL_SYSTEM_FIX.md** — Доповнення/правки фінансової системи (archive)
- **FINANCIAL_TESTING_CHECKLIST.md** — Чекліст перевірки фінансової логіки

#### 2.5 `docs/documentation/mechanics/`

- **GAME_RULES_AND_MECHANICS.md** — Повні правила гри (Cashflow)

### 3) Інші організовані документи

#### 3.1 `docs/project-management/`

- **ROADMAP.md** — Єдиний master roadmap (тут тепер все) ✅
- **archive/Виконано/** — всі старі roadmap/плани/статуси, що завершено ✅

#### 3.2 `docs/technical/`

- **PROJECT_DESIGN.md** — архітектурні рішення, дизайн системи ✅
- **TECHNICAL_ARCHITECTURE.md** — технічна архітектура (компоненти, spike) ✅
- **TESTING_STRATEGY.md** — як тестувати (юнит/інтеграція/мультіплеєр) ✅
- **LOGGING_SETUP.md** — налаштування логування ✅
- **LOBBY_IMPROVEMENTS_SUMMARY.md** — покращення лоббі UI/UX ✅
- **ENHANCED_INTEGRATION_COMPLETE.md** — статус інтеграції (кінець) ✅
- **DOCUMENTATION_AUDIT_REPORT.md** — перевірка документації ✅

#### 3.3 `docs/user-guides/`

- **FRONTEND_TESTING_CHECKLIST.md** — чекліст фронтенд-тестів ✅
- **LOBBY_TESTING_GUIDE.md** — гайд по тестуванню лобі ✅
- **STEP_BY_STEP_FRONTEND_TEST.md** — покрокове тестування фронтенду ✅

### 3) Розробницьке оточення (скрипти та таски)

- `check-rules-documentation.sh` — утиліта для перевірки відповідності rules-документації ✅
- `scripts/tests/` — набір автоматизованих тестів (фінанси, лобі, мультиплеєр) ✅
  - `test-financial-*.sh` — фінансова логіка та синхронізація
  - `test-multiplayer-turns.sh` — логіка передачі ходу
  - `test-create-game-debug.sh` — старт/протокол створення гри
- `start-dev.sh`, `stop-dev.sh` — запуск/зупинка dev серверів ✅

---

## 🟢 Статус: що готово / що в роботі

### 🔥 Готово (archive/Виконано)

- Раніше активні roadmap/plans: `MVP_ROADMAP.md`, `SPRINT_1_PLAN.md`, `SPRINT_PLAN.md`, `USER_STORIES.md`
- Документація по фінансовим виправленням: `FINANCIAL_SYSTEM_CENTRALIZATION_COMPLETE.md`
- Опис стану впровадження: `IMPLEMENTATION_STATUS.md`

> **Зверни увагу:** ці файли зберігаються тільки для історії та рев’ю, їх не використовуємо для поточного планування.

### 🔄 Активно (читати та оновлювати)

- `docs/project-management/ROADMAP.md` → **мастер план**
- `docs/documentation/process/DEVELOPMENT_STRATEGY.md` → стратегії, правила, стандарти
- `docs/documentation/mechanics/GAME_RULES_AND_MECHANICS.md` → правила гри (Cashflow)
- `docs/documentation/process/DEVELOPER_CHECKLIST.md` → процес розробки / релізу
- `docs/documentation/finance/FINANCIAL_TESTING_CHECKLIST.md` → перевірка фінансової частини

---

## 🧩 Як підтримувати порядок (рекомендації)

1. **Новий документ?** Спочатку обговори, чи можна додати до існуючого (наприклад, roadmap або strategy).
2. **Робота завершена?** Переміщай документ/специфікацію в `docs/archive/Виконано/`.
3. **Оновив roadmap?** Зміни мають бути відображені одразу в `docs/project-management/ROADMAP.md`.
4. **Шукай тільки тут:** кожну нову інструкцію/стратегію/аналіз додавай у цей “мастер” або посилання на нього.

---

## 📌 Швидке посилання (для копіювання)

- **MASTER ROADMAP:** `docs/project-management/ROADMAP.md`
- **Стратегія:** `docs/documentation/process/DEVELOPMENT_STRATEGY.md`
- **Правила гри:** `docs/documentation/mechanics/GAME_RULES_AND_MECHANICS.md`
- **Чекліст розробника:** `docs/documentation/process/DEVELOPER_CHECKLIST.md`
- **Архів:** `docs/archive/Виконано/`

---

**Оновлено:** 13 березня 2026  
**Статус:** активний (один master-файл для навігації по документації)
