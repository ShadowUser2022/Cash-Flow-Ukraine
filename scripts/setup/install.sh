#!/bin/bash

# 🚀 Cash Flow Ukraine - Project Setup Script
# Automated setup for development environment

echo "🎮 Setting up Cash Flow Ukraine Project..."
echo "========================================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -c2-)
echo "✅ Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm version: $NPM_VERSION"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Create .env file if not exists
cd ..
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📋 Creating environment configuration..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env file"
    echo "📝 Please review and update backend/.env with your settings"
fi

# Make scripts executable
chmod +x scripts/setup/*.sh
chmod +x scripts/deployment/*.sh
chmod +x backend/scripts/*.js

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the project:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "📡 URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"
echo ""
echo "📚 Documentation available in ./docs/ folder"
