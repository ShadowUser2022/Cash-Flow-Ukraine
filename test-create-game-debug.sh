#!/bin/bash

echo "🧪 ТЕСТУВАННЯ СТВОРЕННЯ ГРИ - Debug"
echo "=================================="
echo ""

echo "1. 🔍 Перевіряємо backend health:"
curl -s http://localhost:3001/health | jq '.' || echo "❌ Backend не відповідає"
echo ""

echo "2. 🎮 Тестуємо створення гри через API:"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/games/create \
  -H "Content-Type: application/json" \
  -d '{"hostId":"test-debug-player-123"}')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ API створення гри працює!"
    GAME_ID=$(echo "$RESPONSE" | jq -r '.game.id')
    echo "📋 Created Game ID: $GAME_ID"
else
    echo "❌ API створення гри НЕ працює!"
fi

echo ""
echo "3. 📊 Frontend debug інструкції:"
echo "   - Відкрийте http://localhost:5173"
echo "   - Натисніть F12 (Developer Console)"
echo "   - Введіть ім'я гравця"
echo "   - Натисніть 'Створити гру' або '🧪 Форсувати створення'"
echo "   - Перевірте логи в консолі:"
echo ""
echo "🔍 Шукайте ці логи:"
echo "   - 'Creating game with playerId: [playerId]'"
echo "   - 'Generated new playerId: [playerId]'"
echo "   - Помилки fetch() або Socket.IO"
echo ""
echo "🐛 Можливі причини проблем:"
echo "   - playerId = undefined або null"
echo "   - playerName порожній"
echo "   - Socket.IO не підключений (status != 'Підключено')"
echo "   - CORS помилки"
echo ""

echo "4. ⚡ Швидкий тест через консоль браузера:"
echo "   Вставте в консоль браузера:"
echo ""
cat << 'EOF'
// Тест створення гри через fetch
fetch('http://localhost:3001/api/games/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId: 'manual-test-' + Date.now() })
})
.then(r => r.json())
.then(d => console.log('✅ Manual API Test:', d))
.catch(e => console.error('❌ Manual API Error:', e));
EOF

echo ""
