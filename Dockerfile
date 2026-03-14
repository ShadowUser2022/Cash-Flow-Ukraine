# Multi-stage Dockerfile для Cash Flow Ukraine Backend
FROM node:18-alpine

# Install curl для health check
RUN apk add --no-cache curl

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy shared source to its sibling location
COPY shared/ /app/shared/

# Copy backend source
COPY backend/ ./

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "cashflow-server-enhanced.js"]
