#!/bin/bash

echo "🎮 Перевірка документації правил гри..."

# Перевіряємо чи існують ключові документи
if [ -f "GAME_RULES_AND_MECHANICS.md" ]; then
    echo "✅ Основні правила гри: GAME_RULES_AND_MECHANICS.md"
else
    echo "❌ Відсутні основні правила гри"
    exit 1
fi

if [ -f "IMPLEMENTATION_PLAN_BASED_ON_RULES.md" ]; then
    echo "✅ План реалізації: IMPLEMENTATION_PLAN_BASED_ON_RULES.md"
else
    echo "❌ Відсутній план реалізації"
    exit 1
fi

if [ -f "docs/project-management/ROADMAP.md" ]; then
    echo "✅ Roadmap оновлений з посиланнями на правила"
else
    echo "❌ Roadmap не знайдений"
    exit 1
fi

echo ""
echo "📋 Зміст основних правил:"
echo "1. 🎯 Мета гри - досягти фінансової свободи"
echo "2. 🎲 Механіка ходів - кубик, рух, дія клітинки"  
echo "3. 💰 Фінансова система - Cash Flow = Дохід - Витрати"
echo "4. 🎴 Картки - малі/великі угоди, витрати, ринкові події"
echo "5. 🏆 Перемога - здійснити мрію на Fast Track"

echo ""
echo "📅 План реалізації:"
echo "• Тиждень 1: Базові механіки (клітинки, картки)"
echo "• Тиждень 2: Розширені механіки (торги, ринок)"  
echo "• Тиждень 3: Fast Track та завершення"

echo ""
echo "🎯 Готово! Команда може розпочинати розробку згідно правил."
