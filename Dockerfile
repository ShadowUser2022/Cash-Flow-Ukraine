# Multi-stage Dockerfile для Cash Flow Ukraine Backend
FROM node:18-alpine

# Install curl для health check
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files з backend
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Expose port (Railway встановить динамічно)
EXPOSE ${PORT:-3001}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# Start server
CMD ["node", "cashflow-server-enhanced.js"]
