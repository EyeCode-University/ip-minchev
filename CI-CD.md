# CI/CD: автодеплой на Timeweb Cloud

Схема простая и надёжная:

```
git push (master)
      │
      ▼
GitHub Actions ──► job "ci":     npm ci → lint → tests → build   (если красное — деплоя нет)
      │
      ▼
GitHub Actions ──► job "deploy": ssh на VPS → scripts/server-deploy.sh
                                      │
                                      ├─ git reset --hard origin/master
                                      ├─ docker compose build web
                                      ├─ docker compose up -d web
                                      ├─ health-check http://127.0.0.1:3000
                                      └─ не ответил → автооткат на прошлый коммит
```

Nginx на сервере остаётся снаружи и проксирует 80/443 → 127.0.0.1:3000. Он деплоем
не трогается, HTTPS-сертификат живёт своей жизнью.

Файлы, которые за это отвечают:

| Файл | Где выполняется | Что делает |
|---|---|---|
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | GitHub | прогоняет тесты, потом заходит по SSH |
| [scripts/server-deploy.sh](scripts/server-deploy.sh) | VPS | обновляет код и пересобирает контейнер |
| [docker-compose.yml](docker-compose.yml) | VPS | описывает контейнер, порт, `.env`, логи |
| [Dockerfile](Dockerfile) | VPS (при сборке) | multi-stage сборка Next.js standalone |

---

## Шаг 1. Подготовить сервер (один раз)

Заходим на VPS под root:

```bash
ssh root@ВАШ_IP
```

Ставим Docker и утилиты:

```bash
apt update && apt upgrade -y
apt install -y curl git nginx ufw
curl -fsSL https://get.docker.com | sh
```

Firewall:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

Создаём пользователя `deploy` (под ним будет ходить CI, root наружу не отдаём):

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy      # право запускать docker без sudo
```

---

## Шаг 2. Положить проект на сервер (один раз)

```bash
su - deploy
git clone https://github.com/EyeCode-University/ip-minchev.git ~/app
cd ~/app
```

> Репозиторий приватный? Тогда либо сделайте clone по HTTPS с
> [Personal Access Token](https://github.com/settings/tokens) (`git clone https://<TOKEN>@github.com/...`),
> либо заведите deploy-key: `ssh-keygen -t ed25519 -f ~/.ssh/gh_deploy -N ""`,
> публичную часть добавьте в **Settings → Deploy keys** репозитория,
> и клонируйте по `git@github.com:...`.

Создаём `.env` с секретами (в git его нет и быть не должно):

```bash
cp .env.docker.example .env
nano .env
```

Заполняем реальными значениями (`SMTP_PASSWORD` — пароль **приложения** Яндекса),
сохраняем `Ctrl+O`, `Enter`, `Ctrl+X`. Закрываем файл от чужих глаз:

```bash
chmod 600 .env
```

Первый запуск руками — чтобы убедиться, что всё работает до всякого CI:

```bash
docker compose up -d --build
curl -I http://127.0.0.1:3000     # ожидаем 200 OK
```

---

## Шаг 3. SSH-ключ для GitHub Actions (один раз)

Ключ генерируем **на своём компьютере** (PowerShell), без пароля — CI не сможет его ввести:

```powershell
ssh-keygen -t ed25519 -C "github-actions-minchev" -f $env:USERPROFILE\.ssh\minchev_deploy -N '""'
```

Получилось два файла: `minchev_deploy` (приватный) и `minchev_deploy.pub` (публичный).

Публичный кладём на сервер пользователю `deploy`:

```powershell
type $env:USERPROFILE\.ssh\minchev_deploy.pub | ssh root@ВАШ_IP "mkdir -p /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys"
```

Проверяем, что вход работает:

```powershell
ssh -i $env:USERPROFILE\.ssh\minchev_deploy deploy@ВАШ_IP "docker ps"
```

---

## Шаг 4. Secrets в GitHub (один раз)

Репозиторий → **Settings → Secrets and variables → Actions → New repository secret**.
Нужны пять штук:

| Имя | Значение |
|---|---|
| `SSH_HOST` | IP вашего VPS из панели Timeweb |
| `SSH_PORT` | `22` (или ваш, если меняли) |
| `SSH_USER` | `deploy` |
| `SSH_KEY` | **всё содержимое приватного ключа** `minchev_deploy`, вместе со строками `-----BEGIN...` и `-----END...` |
| `APP_DIR` | `/home/deploy/app` |

Скопировать приватный ключ в буфер:

```powershell
Get-Content $env:USERPROFILE\.ssh\minchev_deploy | Set-Clipboard
```

> Приватный ключ нигде больше не светим и в репозиторий не коммитим.

---

## Шаг 5. Nginx + HTTPS (один раз)

Конфиг из [DEPLOY.md](DEPLOY.md) (раздел 5–6) остаётся актуальным: `proxy_pass
http://127.0.0.1:3000`, обязательно `client_max_body_size 15M` — иначе чертежи
больше ~1 МБ не дойдут до формы. Дальше `certbot --nginx -d домен.ru`.

---

## Шаг 6. Включить автодеплой

Коммитим и пушим то, что сейчас добавлено:

```powershell
git add .github scripts/server-deploy.sh docker-compose.yml CI-CD.md
git commit -m "CI/CD: автодеплой на VPS через GitHub Actions"
git push
```

Первый push сам запустит пайплайн. Смотреть — вкладка **Actions** в репозитории.

---

## Как теперь выглядит обычный рабочий день

```powershell
# правим код локально
npm run dev          # проверили в браузере
npm test             # прогнали тесты
git add -A
git commit -m "Поменял текст в блоке контактов"
git push
```

Всё. Через ~2–4 минуты изменения на боевом сайте. Ничего руками на сервере делать не нужно.

Хочется выкатить без изменений в коде (например, перезапустить) — вкладка
**Actions → Deploy → Run workflow**.

---

## Что происходит, если что-то сломалось

- **Красный job `ci`** — тесты/линт/сборка упали. Деплой не запускается вообще,
  на сайте продолжает крутиться старая рабочая версия. Чините локально и пушите снова.
- **Красный job `deploy`** — код на сервере обновился, но сайт не ответил за минуту.
  Скрипт сам откатывает `git reset --hard` на предыдущий коммит и пересобирает старую
  версию. В логе Actions видно последние 50 строк логов контейнера.
- **Ручной откат** на сервере:

  ```bash
  cd ~/app
  git log --oneline -10        # выбрали нужный коммит
  git reset --hard <хэш>
  docker compose up -d --build
  ```

---

## Шпаргалка по серверу

| Действие | Команда (на VPS, в `~/app`) |
|---|---|
| Статус контейнера | `docker compose ps` |
| Логи приложения | `docker compose logs -f web` |
| Перезапуск | `docker compose restart web` |
| Пересобрать вручную | `docker compose up -d --build` |
| Поменять секреты | `nano .env && docker compose up -d` |
| Место на диске | `docker system df` / `docker system prune -a` |
| Проверить Nginx | `sudo nginx -t && sudo systemctl reload nginx` |

---

## Частые грабли

- **Поменяли `.env` — изменения не применились.** `env_file` читается при создании
  контейнера: нужен `docker compose up -d` (не `restart`).
- **`permission denied` на docker в CI.** Забыли `usermod -aG docker deploy` или
  не перелогинились после этого.
- **Сборка падает по памяти на 2 ГБ RAM.** Добавьте swap:
  `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`
  и строку `/swapfile none swap sw 0 0` в `/etc/fstab`.
- **Диск забился образами.** `docker system prune -af` (скрипт деплоя чистит только
  висячие образы).
