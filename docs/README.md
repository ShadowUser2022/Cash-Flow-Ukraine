# 📚 Cash Flow Ukraine - Documentation Index

Це центральний індекс всієї документації проекту Cash Flow Ukraine.

## 🗂️ Структура документації

### 📡 API Documentation
- **[REST API](./api/REST-API.md)** - Повна документація REST API endpoints
- **[Socket.IO Events](./api/REST-API.md#socketio-events)** - Real-time події та їх обробка

### 🏗️ Technical Documentation
- **[Enhanced Integration Complete](./technical/ENHANCED_INTEGRATION_COMPLETE.md)** - Повний статус інтеграції
- **[Technical Architecture](./technical/TECHNICAL_ARCHITECTURE.md)** - Архітектура системи
- **[Project Design](./technical/PROJECT_DESIGN.md)** - Дизайн проекту
- **[Testing Strategy](./technical/TESTING_STRATEGY.md)** - Стратегія тестування
- **[Logging Setup](./technical/LOGGING_SETUP.md)** - Налаштування логування
- **[Lobby Improvements](./technical/LOBBY_IMPROVEMENTS_SUMMARY.md)** - Покращення лобі

### 👨‍💻 User Guides
- **[Frontend Testing Guide](./user-guides/STEP_BY_STEP_FRONTEND_TEST.md)** - Покроковий тест фронтенду
- **[Frontend Testing Checklist](./user-guides/FRONTEND_TESTING_CHECKLIST.md)** - Чекліст тестування
- **[Lobby Testing Guide](./user-guides/LOBBY_TESTING_GUIDE.md)** - Тестування лобі

### 📋 Project Management
- **[Roadmap](./project-management/ROADMAP.md)** - Дорожня карта проекту
- **[Sprint Plan](./project-management/SPRINT_PLAN.md)** - План спринтів
- **[User Stories](./project-management/USER_STORIES.md)** - Користувацькі історії

## 🚀 Quick Start Links

### For Developers
1. **Setup**: Run `./scripts/setup/install.sh`
2. **API Reference**: [REST API Documentation](./api/REST-API.md)
3. **Architecture**: [Technical Architecture](./technical/TECHNICAL_ARCHITECTURE.md)
4. **Testing**: [Frontend Testing Guide](./user-guides/STEP_BY_STEP_FRONTEND_TEST.md)

### For Testers
1. **Frontend Tests**: [Testing Checklist](./user-guides/FRONTEND_TESTING_CHECKLIST.md)
2. **Lobby Tests**: [Lobby Testing Guide](./user-guides/LOBBY_TESTING_GUIDE.md)
3. **Integration Status**: [Enhanced Integration](./technical/ENHANCED_INTEGRATION_COMPLETE.md)

### For Project Managers
1. **Roadmap**: [Project Roadmap](./project-management/ROADMAP.md)
2. **Sprint Planning**: [Sprint Plan](./project-management/SPRINT_PLAN.md)
3. **User Stories**: [User Stories](./project-management/USER_STORIES.md)

## 🎯 Current Project Status

### ✅ Completed Features
- ✅ **Backend Enhanced**: TypeScript + Express + Socket.IO
- ✅ **Game Services**: DealService, GameMechanicsService, GameService
- ✅ **API**: Повний набір endpoints для гри
- ✅ **In-memory Storage**: Працює без MongoDB
- ✅ **Real-time**: Socket.IO події налаштовані
- ✅ **Frontend**: React + Vite готовий до інтеграції

### 🔄 In Progress
- 🔄 **Frontend Integration**: Інтеграція з новими API
- 🔄 **Game Mechanics**: Повна ігрова логіка
- 🔄 **UI/UX**: Покращення інтерфейсу

### 📋 Planned Features
- 📋 **WebRTC Video Chat**: Відео спілкування
- 📋 **Advanced Game Features**: Розширені можливості гри
- 📋 **Mobile Support**: Підтримка мобільних пристроїв

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm або yarn

### Quick Setup
```bash
# Clone repository
git clone <repository-url>
cd "Cash Flow Ukr"

# Run setup script
./scripts/setup/install.sh

# Start development
npm run dev  # Backend
npm run dev  # Frontend (in another terminal)
```

### URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **API Games**: http://localhost:3001/api/games

## 📞 Support

For technical questions, refer to:
1. [Technical Architecture](./technical/TECHNICAL_ARCHITECTURE.md)
2. [API Documentation](./api/REST-API.md)
3. [Testing Guides](./user-guides/)

---

**Last Updated**: June 15, 2025  
**Project Version**: 2.0.0-enhanced  
**Documentation Version**: 1.0.0
