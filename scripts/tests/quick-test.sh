#!/bin/bash

# Швидкий тест після кожного завдання
echo "🧪 QUICK TEST CHECKLIST"
echo "======================="

echo ""
echo "📋 BEFORE TESTING:"
echo "1. Backend running: http://localhost:3001/health"
echo "2. Frontend running: http://localhost:5173"
echo "3. No TypeScript errors in terminal"

echo ""
echo "🎮 BASIC GAME FLOW TEST:"
echo "1. ✅ Create game → get Game ID" 
echo "2. ✅ Join game with second tab"
echo "3. ✅ Start game from lobby"
echo "4. ✅ Roll dice → event card appears"
echo "5. ✅ Handle event card → finances update"  
echo "6. ✅ Complete turn → monthly finances calculated"
echo "7. ✅ Check Fast Track condition"

echo ""
echo "🎨 UX IMPROVEMENTS TO CHECK:"
echo "- [ ] Card animations smooth"
echo "- [ ] Toast notifications appear"
echo "- [ ] Colors match actions (green=income, red=expense)"
echo "- [ ] Hover effects work"
echo "- [ ] Progress bars visible"
echo "- [ ] Tooltips show up"

echo ""
echo "📱 MOBILE TEST:"
echo "- [ ] Open Chrome DevTools"
echo "- [ ] Switch to mobile view (iPhone/Android)"
echo "- [ ] Test touch interactions"
echo "- [ ] Check responsive design"

echo ""
echo "🐛 BUG PREVENTION:"
echo "- [ ] Try negative numbers"
echo "- [ ] Test rapid clicking"
echo "- [ ] Disconnect/reconnect"
echo "- [ ] Multiple players same action"

echo ""
echo "🏁 READY FOR NEXT TASK?"
echo "Type 'yes' if all tests pass ✅"
read -p "Ready? " response

if [ "$response" = "yes" ]; then
    echo "🚀 Moving to next task!"
else
    echo "🔧 Fix issues first, then test again"
fi
