---
applyTo: '**'
---
# Coding Standards

- Дотримуйтесь принципів чистого коду (Clean Code).
- Використовуйте зрозумілі імена змінних, функцій та класів (англійською).
- Додавайте коментарі до складних ділянок коду.
- Дотримуйтесь єдиного стилю форматування (наприклад, Prettier або стандарт проекту).

# Domain Knowledge

- Проект стосується фінансового обліку та управління грошовими потоками в Україні.
- Використовуйте відповідну термінологію (наприклад, "transaction", "balance", "income", "expense").
- Підтримуйте локалізацію для української мови, якщо це потрібно.

# Preferences

- Віддавайте перевагу функціональному стилю там, де це доречно.
- Для асинхронних операцій використовуйте async/await.
- Пишіть юніт-тести для основної бізнес-логіки.
- Уникайте "магічних чисел" — використовуйте константи з осмисленими іменами.
- Валідуйте вхідні дані на всіх рівнях.

# Security

- Не зберігайте чутливі дані у відкритому вигляді.
- Використовуйте сучасні підходи до аутентифікації та авторизації.

# Documentation

- Описуйте публічні API та основні класи/методи.
- Додавайте README та інструкції для запуску проекту.

# File Management

- Перед створенням нових файлів завжди перевіряйте існуючу структуру проекту.
- Уникайте дублювання файлів — використовуйте наявні модулі та компоненти.
- Організовуйте файли логічно за функціональним призначенням.
- Віддавайте перевагу розширенню існуючого функціоналу замість створення нових файлів.
- Консолідуйте подібний код в одному місці для кращої підтримки.


# Project Documentation

## Structure Overview

### `/server`
- **Location**: Server-side application
- **Purpose**: Backend API and business logic implementation

### `/client` or `/frontend`
- **Location**: Frontend application files
- **Purpose**: User interface and client-side functionality

### `/docs`
- **Location**: Project documentation
- **Purpose**: Technical specifications, API docs, and project guidelines

### Game Mechanics
- **File**: `game-mechanics.js` or similar
- **Location**: `/server/mechanics/` or `/shared/`
- **Purpose**: Core game logic, rules, and player interactions

### Frontend Components
- **Files**: `*.vue`, `*.jsx`, `*.ts` components
- **Location**: `/client/src/components/`
- **Purpose**: UI components, views, and state management

*Note: Specific file analysis requires actual code selection to provide detailed documentation.*

## Cash Flow Ukraine - Project Structure

### Core Financial Modules

#### `/server/models/`
- **`Transaction.js`** - Transaction entity (income/expense records)
- **`Account.js`** - Bank accounts and cash management
- **`Category.js`** - Income/expense categories
- **`Budget.js`** - Budget planning and tracking
- **`User.js`** - User profile and preferences

#### `/server/services/`
- **`TransactionService.js`** - Transaction CRUD operations
- **`BudgetService.js`** - Budget calculations and analytics
- **`ReportService.js`** - Financial reports generation
- **`ExportService.js`** - Data export (CSV, PDF)
- **`CurrencyService.js`** - UAH exchange rates and conversions

#### `/server/controllers/`
- **`TransactionController.js`** - Transaction API endpoints
- **`DashboardController.js`** - Main dashboard data
- **`ReportsController.js`** - Analytics and reports
- **`AuthController.js`** - User authentication

### Frontend Structure

#### `/client/src/views/`
- **`Dashboard.vue`** - Main financial overview
- **`Transactions.vue`** - Transaction management
- **`Budget.vue`** - Budget planning interface
- **`Reports.vue`** - Analytics and charts
- **`Settings.vue`** - User preferences

#### `/client/src/components/`
- **`TransactionForm.vue`** - Add/edit transactions
- **`BudgetChart.vue`** - Budget visualization
- **`CategoryPicker.vue`** - Category selection
- **`CurrencyInput.vue`** - UAH amount input
- **`DateRangePicker.vue`** - Period selection

#### `/client/src/utils/`
- **`currency.js`** - UAH formatting utilities
- **`validation.js`** - Input validation rules
- **`dateHelpers.js`** - Date manipulation functions
- **`chartConfig.js`** - Chart.js configurations

### Configuration & Assets

#### `/config/`
- **`database.js`** - Database connection settings
- **`localization.js`** - Ukrainian language settings
- **`constants.js`** - Financial categories and limits

#### `/assets/`
- **`i18n/ua.json`** - Ukrainian translations
- **`icons/categories/`** - Category icons
- **`templates/reports/`** - Report templates