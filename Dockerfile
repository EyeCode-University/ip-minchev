# syntax=docker/dockerfile:1

# Multi-stage сборка сайта ИП Минчев Р.М. (Next.js 16, standalone output).
# Готовый образ запускает `next start` через минимальный server.js — ничего
# вручную распаковывать/собирать на сервере не нужно: docker build + docker run.

############################
# 1. Зависимости
############################
FROM node:20-alpine AS deps
WORKDIR /app

# Только манифесты — слой с npm ci кэшируется, пока lock-файл не изменился.
COPY package.json package-lock.json ./
RUN npm ci

############################
# 2. Сборка
############################
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

############################
# 3. Рантайм
############################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Непривилегированный пользователь.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Статика и публичные ассеты (галерея, шрифты) не входят в standalone — копируем явно.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# server.js — точка входа, которую генерирует standalone-сборка.
CMD ["node", "server.js"]
