# Multi-stage production image
# Stage 1: install all deps + generate Prisma Client
# Stage 2: copy runtime artifacts only
# Runtime secrets (JWT, MYSQL_*) must be passed when the container starts — never baked into the image.

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# prisma.config.ts falls back to a placeholder URL for generate (no DB connection needed)
RUN npm ci && npx prisma generate

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY src ./src

USER nodejs

EXPOSE 3000

CMD ["node", "src/server.js"]
