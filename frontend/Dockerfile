FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace frontend
COPY frontend frontend
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine
COPY --from=build /repo/frontend/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
