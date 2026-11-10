# Multi-stage Dockerfile for Scamora Backend
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependency installation stage
FROM base AS dependencies
COPY package*.json ./
RUN npm install

# Development stage with hot-reloading
FROM base AS development
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]

# Build stage for production
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

# Production runtime stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 8000
CMD ["npm", "start"]
