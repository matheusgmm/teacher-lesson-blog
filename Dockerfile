FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/app.js"]
