#!/bin/bash

# Quick Start Script for Cash Flow Ukraine
echo "🚀 Starting Cash Flow Ukraine..."

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend..."
    cd backend && node cashflow-server-enhanced.js &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend  
start_frontend() {
    echo "🎨 Starting Frontend..."
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
}

# Start both
start_backend
sleep 2
start_frontend

echo "✅ Both servers starting..."
echo "🔍 Backend: http://localhost:3001"
echo "🎮 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
