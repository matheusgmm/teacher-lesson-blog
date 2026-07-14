# Multi-stage production image
# Stage 1: install all deps + generate Prisma Client
# Stage 2: copy runtime artifacts only

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Dummy DB URL values — required by prisma.config.ts during generate (no live DB needed)
ENV MYSQL_HOST=localhost \
    MYSQL_PORT=3306 \
    MYSQL_USER=ci \
    MYSQL_PASSWORD=ci \
    MYSQL_DATABASE=teacher_lesson_blog

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
