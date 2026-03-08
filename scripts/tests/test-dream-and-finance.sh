#!/bin/bash

echo "🧪 Testing Financial Operations & Dream Selection"
echo "================================================"

# Чекаємо чи працює backend
echo "🔍 Checking backend health..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start with: npm run dev:backend"
    exit 1
fi

# Чекаємо чи працює frontend
echo "🔍 Checking frontend..."
FRONTEND_CHECK=$(curl -s http://localhost:5173 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not running. Please start with: npm run dev:frontend"
    exit 1
fi

echo ""
echo "🎮 Financial Operations Test Instructions:"
echo "=========================================="
echo ""
echo "1. 🌟 Dream Selection Test:"
echo "   - Open http://localhost:5173"
echo "   - Join a game"
echo "   - You should see a dream selection modal BEFORE dice roll"
echo "   - Select any dream and confirm"
echo ""
echo "2. 💸 Expense Payment Test:"
echo "   - Roll dice to land on a Doodad (expense) cell"
echo "   - Click 'Pay' button"
echo "   - Check that balance decreases (-)"
echo ""
echo "3. 💰 Income Receipt Test:"
echo "   - Land on a cell with receive_money effect"
echo "   - Click 'Receive' button" 
echo "   - Check that balance increases (+)"
echo ""
echo "4. ❤️ Charity Test:"
echo "   - Land on charity cell"
echo "   - Choose donation percentage"
echo "   - Check balance decreases accordingly (-)"
echo ""
echo "5. 📈 Market Action Test:"
echo "   - Draw a market card"
echo "   - Execute the action"
echo "   - Check balance changes (+ or - depending on card)"
echo ""
echo "6. 🎯 Player Panel Dream Display:"
echo "   - Check player panel shows selected dream"
echo "   - Dream should have icon, title, and cost"
echo ""
echo "🔧 Backend Console Logs to Watch:"
echo "- Player finances initialized"
echo "- Balance updates with +/- amounts"
echo "- Transaction records created"
echo ""
echo "🎮 Frontend Console Logs to Watch:"
echo "- Dream selection completed"
echo "- Socket events for financial operations"
echo "- Player state updates"
echo ""
echo "✅ All financial operations should:"
echo "   - Update balance in real-time"
echo "   - Show notifications"
echo "   - Sync between all players"
echo "   - Complete turn automatically"
echo ""
echo "🚀 Ready to test! Open http://localhost:5173"
