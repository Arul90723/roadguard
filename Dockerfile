# Multi-stage Dockerfile for RoadGuard on Google Cloud Run
# 1. Build Frontend (React + Vite + TypeScript)
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 2. Build Backend (Node.js + Express + TypeScript)
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# 3. Production Runtime Container
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy server package and production dependencies
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src/db/schema.sql ./dist/db/schema.sql

# Copy compiled frontend into client/dist
WORKDIR /app
COPY --from=client-builder /app/client/dist ./client/dist

# Create uploads directory for evidence storage
RUN mkdir -p /app/server/uploads

EXPOSE 8080

WORKDIR /app/server
CMD ["node", "dist/index.js"]
