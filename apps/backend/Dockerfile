FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY apps/backend/package*.json ./
RUN npm ci --only=production

# Build
FROM base AS builder
COPY apps/backend/package*.json ./
RUN npm ci
COPY apps/backend/ .
COPY apps/backend/prisma ./prisma
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/index.js"]
