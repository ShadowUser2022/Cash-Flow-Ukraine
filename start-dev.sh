#!/bin/bash

# Cash Flow Ukraine - Development Server Starter
# Автоматично зупиняє існуючі сервери і запускає нові на фіксованих портах

echo "🚀 Starting Cash Flow Ukraine Development Environment..."

# Зупиняємо існуючі процеси на портах
echo "🛑 Stopping existing servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  # Backend port
lsof -ti:5173 | xargs kill -9 2>/dev/null || true  # Frontend port

# Очищаємо процеси по імені
pkill -f 'cashflow-server-enhanced.js' 2>/dev/null || true
pkill -f 'npm run dev' 2>/dev/null || true
pkill -f 'vite' 2>/dev/null || true

echo "✅ Old servers stopped"

# Перевіряємо, чи існують необхідні директорії
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: frontend or backend directory not found!"
    exit 1
fi

# Ensure logs directory exists
mkdir -p logs

# Запускаємо backend (на порту 3001) з логуванням
echo "🚀 Starting Backend Server (port 3001)..."
cd backend
nohup node cashflow-server-enhanced.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
cd ..

# Чекаємо трохи перед запуском frontend
sleep 2

# Запускаємо frontend (на порту 5173) з логуванням та network доступом
echo "🎨 Starting Frontend Dev Server (port 5173)..."
cd frontend
nohup npm run dev -- --host > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
cd ..

echo ""
echo "🎉 Development servers started successfully!"
echo "📱 Frontend: https://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop all servers, run: ./stop-dev.sh"
echo "Or use VS Code task: 🛑 Stop All Servers"
