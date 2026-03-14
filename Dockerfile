# Multi-stage Dockerfile для Cash Flow Ukraine Backend
FROM node:18-alpine

# Install curl для health check
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files з backend
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy shared source
COPY shared/ ../shared/

# Copy backend source
COPY backend/ ./

# Expose port (Railway встановить динамічно через env var)
EXPOSE 3001

# Start server (Railway's health check буде використовувати railway.json)
CMD ["node", "cashflow-server-enhanced.js"]
