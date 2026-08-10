#!/bin/bash
echo "🚀 Запуск сервера Cashflow Ukraine на локальному комп'ютері..."
cd "$(dirname "$0")"
./node_modules/.bin/tsx server.ts
