#!/usr/bin/env bash
# Выполняется НА СЕРВЕРЕ (его дёргает GitHub Actions по SSH).
# Задача: подтянуть новый код, пересобрать образ, поднять контейнер,
# убедиться что сайт отвечает, и откатиться, если нет.
set -euo pipefail

BRANCH="${DEPLOY_BRANCH:-master}"
SERVICE="web"
HEALTH_URL="http://127.0.0.1:3000/"
HEALTH_RETRIES=30

log() { echo "==> $*"; }

# docker compose (v2) или docker-compose (v1) — берём что есть.
if docker compose version >/dev/null 2>&1; then
  DC="docker compose"
else
  DC="docker-compose"
fi

log "Текущий коммит: $(git rev-parse --short HEAD)"
PREV_COMMIT="$(git rev-parse HEAD)"

log "Забираем изменения из origin/$BRANCH"
git fetch --prune origin "$BRANCH"
git reset --hard "origin/$BRANCH"   # сервер — зеркало репозитория, локальных правок тут быть не должно
log "Новый коммит: $(git rev-parse --short HEAD)"

if [ ! -f .env ]; then
  echo "ОШИБКА: нет файла .env рядом с docker-compose.yml (секреты SMTP/Telegram)." >&2
  exit 1
fi

log "Сборка образа"
$DC build "$SERVICE"

log "Перезапуск контейнера"
$DC up -d "$SERVICE"

log "Проверка здоровья ($HEALTH_URL)"
for i in $(seq 1 $HEALTH_RETRIES); do
  if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then
    log "Сайт отвечает (попытка $i)"
    log "Чистка старых образов"
    docker image prune -f >/dev/null || true
    log "Деплой завершён успешно"
    exit 0
  fi
  sleep 2
done

echo "ОШИБКА: сайт не ответил за $((HEALTH_RETRIES * 2))с — откатываемся на $PREV_COMMIT" >&2
$DC logs --tail=50 "$SERVICE" || true
git reset --hard "$PREV_COMMIT"
$DC build "$SERVICE"
$DC up -d "$SERVICE"
echo "Откат выполнен. Разбирайтесь с логами выше." >&2
exit 1
