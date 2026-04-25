FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace backend

FROM deps AS build
COPY backend/tsconfig.json backend/tsconfig.json
COPY backend/src backend/src
RUN npm run build --workspace backend

FROM node:22-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace backend --omit=dev
COPY --from=build /repo/backend/dist backend/dist
EXPOSE 3001
CMD ["node", "backend/dist/server.js"]
