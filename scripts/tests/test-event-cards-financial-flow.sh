#!/bin/bash

# Тестовий скрипт для перевірки карток подій та грошового потоку
# Запускається після початку серверів

echo "🧪 Testing Event Cards and Financial Flow System"
echo "=============================================="

# Backend URL
BACKEND_URL="http://localhost:3001"

echo ""
echo "📋 Step 1: Check server health"
curl -s "$BACKEND_URL/health" | echo "Backend status: $(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)"

echo ""
echo "🎮 Step 2: Get available games"
echo "Current games:"
curl -s "$BACKEND_URL/api/games" | jq '.' 2>/dev/null || echo "No JSON response or jq not available"

echo ""
echo "✅ Test Ready!"
echo ""
echo "🎯 FEATURES TO TEST:"
echo "1. 🎲 Roll dice - автоматично генерується карта події"
echo "2. 💰 Monthly finances - автоматично рахується після кожного ходу"
echo "3. 💳 Event cards:"
echo "   - Opportunity cards (купівля активів)"
echo "   - Market cards (ринкові події)"
echo "   - Doodad cards (витрати)"
echo "   - Charity cards (благодійність)"
echo "4. 📊 Financial calculations:"
echo "   - Passive Income = сума cashFlow всіх активів"
echo "   - Total Expenses = profession expenses + зобов'язання"
echo "   - Net Cash Flow = salary + passive income - total expenses"
echo "   - Auto debt if cash goes negative"
echo "5. 🚀 Fast Track condition:"
echo "   - Passive Income > Total Expenses"
echo ""
echo "🔧 HOW TO TEST:"
echo "1. Відкрити фронтенд: http://localhost:5173"
echo "2. Створити гру або приєднатися"
echo "3. Кинути кубик"
echo "4. Обробити карту події що з'явилася"
echo "5. Завершити хід - побачити обновлені фінанси"
echo "6. Перевірити чи спрацювала умова швидкої доріжки"
echo ""
echo "📝 LOGS TO WATCH:"
echo "- Backend logs: показують генерацію карток і розрахунки"
echo "- Frontend notifications: показують результати операцій"
echo "- Socket events: dice-rolled (з eventCard), turn-completed (з monthlyFinances)"
