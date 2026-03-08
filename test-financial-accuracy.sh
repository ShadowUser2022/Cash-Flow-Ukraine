#!/bin/bash

# 🧪 Тест фінансових розрахунків після покупки активів
# Перевіряємо чи правильно оновлюються passiveIncome, expenses та cashFlow

echo "🧪 TESTING FINANCIAL CALCULATIONS AFTER ASSET PURCHASES"
echo "======================================================="

echo ""
echo "📋 ТЕСТОВИЙ ПЛАН:"
echo "1. 🎲 Кинути кубик для отримання карти події з угодою"
echo "2. 💰 Придбати актив через карту події" 
echo "3. ✅ Перевірити що:"
echo "   - passiveIncome правильно збільшився на cashFlow активу"
echo "   - загальний баланс готівки зменшився на downPayment"
echo "   - актив додався до списку активів"
echo "   - швидка доріжка перевіряється коректно"
echo "4. 🔄 Завершити хід і перевірити місячні розрахунки"
echo "5. 📊 Перевірити що фінансовий звіт відображає нові дані"

echo ""
echo "🎯 КРИТИЧНІ ПЕРЕВІРКИ:"
echo "✓ passiveIncome = сума cashFlow всіх активів (не дублюється)"
echo "✓ expenses = професійні витрати + платежі по зобов'язаннях"
echo "✓ netCashFlow = salary + passiveIncome - expenses"
echo "✓ Умова швидкої доріжки: passiveIncome > expenses"

echo ""
echo "🚀 ДЛЯ ТЕСТУВАННЯ:"
echo "1. Відкрити: http://localhost:5173"
echo "2. Створити тестову гру (DEV-MODE)"
echo "3. Кинути кубик кілька разів поки не з'явиться карта з угодою"
echo "4. Купити угоду і перевірити зміни"
echo "5. Завершити хід і перевірити місячні фінанси"

echo ""
echo "📝 ЛОГИ ДЛЯ ВІДСТЕЖЕННЯ:"
echo "- Backend: 💰 Recalculated finances for [player]"
echo "- Frontend: Notification з результатом покупки"
echo "- Socket events: deal-completed, turn-completed з новими finances"

echo ""
echo "🔍 BACKEND HEALTH CHECK:"
curl -s http://localhost:3001/health | head -1

echo ""
echo ""
echo "🎮 ГОТОВО ДО ТЕСТУВАННЯ!"
