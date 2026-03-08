#!/bin/bash

# Cash Flow Ukraine - Development Server Stopper
# Зупиняє всі dev сервери проекту

echo "🛑 Stopping Cash Flow Ukraine Development Environment..."

# Зупиняємо процеси на конкретних портах
echo "🔌 Stopping servers on ports 3001 and 5173..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Зупиняємо процеси по імені
echo "🔄 Stopping processes by name..."
pkill -f 'cashflow-server-enhanced.js' 2>/dev/null || true
pkill -f 'npm run dev' 2>/dev/null || true
pkill -f 'vite' 2>/dev/null || true
pkill -f 'nodemon' 2>/dev/null || true

# Додаткова перевірка для Node.js процесів
pkill -f 'node.*vite' 2>/dev/null || true

echo "✅ All development servers stopped!"
echo ""
echo "To start again, run: ./start-dev.sh"
echo "Or use VS Code task: 🚀 Start Backend Server + 🎨 Start Frontend Dev"
