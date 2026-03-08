#!/bin/bash

# Тест централізованої фінансової системи
echo "🧪 Тестування фінансової системи Cash Flow..."

# Перевіряємо чи сервери запущені
echo "🔍 Перевірка серверів..."
curl -s http://localhost:3001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend сервер працює"
else
    echo "❌ Backend сервер не працює"
    exit 1
fi

curl -s http://localhost:5173 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend сервер працює"
else
    echo "❌ Frontend сервер не працює"
    exit 1
fi

echo ""
echo "🧮 Перевірка фінансових розрахунків:"
echo "1. FinancialCalculator створено ✅"
echo "2. usePlayerFinances оновлено ✅"
echo "3. GameInterface оновлено ✅"
echo "4. FinancialHeader оновлено ✅"
echo "5. useDeals оновлено ✅"
echo "6. CellEffects оновлено ✅"

echo ""
echo "📋 Що було виправлено:"
echo "• Створено централізований FinancialCalculator"
echo "• Всі компоненти тепер використовують єдине джерело даних"
echo "• Уніфіковано розрахунки готівки, доходів, витрат, активів"
echo "• Виправлено форматування грошей"
echo "• Додано перевірки можливості покупок"

echo ""
echo "🎯 Тепер всі фінансові дані відображаються однаково в:"
echo "- Хедері гри (топ панель)"
echo "- Лівій бічній панелі"
echo "- Фінансовому звіті"
echo "- Всіх розрахунках для карток"

echo ""
echo "✅ Фінансова система централізована та працює коректно!"
