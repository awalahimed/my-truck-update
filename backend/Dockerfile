# Multi-stage Dockerfile
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build:rendor

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src/ ./src/

RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=backend-builder /app/dist ./dist

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./front-end-build/

RUN mkdir -p uploads

RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

RUN chown -R backend:nodejs /app

USER backend

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["npm", "run", "serve"]
