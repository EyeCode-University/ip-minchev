# Деплой на российский VPS (Ubuntu 22.04 / 24.04)

Инструкция по развёртыванию сайта **ИП Минчев Р.М.** (Next.js 16) на VPS:
Node.js + PM2 (процесс-менеджер) + Nginx (reverse proxy + HTTPS).

Подходящие провайдеры: **Timeweb Cloud, Reg.ru, Selectel, Beget, VK Cloud**.
Минимальная конфигурация: **1–2 vCPU, 2 ГБ RAM, 20 ГБ SSD, Ubuntu**.

---

## 0. Что важно знать про этот проект

- Приложение **нельзя** выгрузить статикой: форма работает через **Server Actions + Nodemailer (SMTP)**, нужен живой Node.js-процесс (`next start`).
- Нужен **Node.js 20+** (Next.js 16).
- Форма отправляет письма на **Yandex SMTP (порт 465)** — VPS должен иметь **исходящий** доступ на `smtp.yandex.ru:465` (обычно открыт по умолчанию).
- Все секреты лежат в `.env.local` — этот файл **не коммитится** в git, его переносим на сервер вручную.

---

## 1. Подготовка сервера

Подключитесь к VPS по SSH (данные дал провайдер):

```bash
ssh root@ВАШ_IP
```

Обновите систему и поставьте инструменты:

```bash
apt update && apt upgrade -y
apt install -y curl git nginx ufw
```

Поставьте **Node.js 20 LTS** (через NodeSource):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v   # должно быть v20.x или выше
```

Поставьте **PM2** (держит приложение запущенным и поднимает после перезагрузки):

```bash
npm install -g pm2
```

Настройте firewall:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'   # открывает 80 и 443
ufw enable
```

---

## 2. Загрузка кода на сервер

Создайте отдельного пользователя (не работайте под root) — по желанию, но рекомендуется:

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

Заберите код. Вариант A — через **git** (если проект в GitHub/GitLab):

```bash
cd ~
git clone ВАШ_РЕПОЗИТОРИЙ my-app
cd my-app
```

Вариант B — **загрузить вручную** с локальной машины (если репозитория нет).
Выполните **на своём компьютере** (PowerShell), исключая лишнее:

```powershell
# из папки проекта d:\Desktop\Новая папка\ip_minchev\my-app
scp -r .\src .\public .\scripts .\package.json .\package-lock.json `
    .\next.config.mjs .\jsconfig.json .\eslint.config.mjs `
    deploy@ВАШ_IP:/home/deploy/my-app/
```

> `node_modules` и `.next` **не копируйте** — соберём на сервере.

---

## 3. Переменные окружения

На сервере в корне проекта создайте `.env.local` с реальными значениями
(те же, что у вас локально):

```bash
cd ~/my-app
nano .env.local
```

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=minchevaerika@yandex.ru
SMTP_PASSWORD=пароль_приложения_яндекса
EMAIL_TO=minchevaerika@yandex.ru

TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=ваш_chat_id
```

Сохраните (`Ctrl+O`, `Enter`, `Ctrl+X`).

> `SMTP_PASSWORD` — это **пароль приложения** Яндекса, не пароль от почты.

---

## 4. Сборка и запуск

```bash
cd ~/my-app
npm ci                 # установка зависимостей строго по lock-файлу
npm run build          # production-сборка (Turbopack)
```

Запуск через PM2 (Next.js по умолчанию слушает порт 3000):

```bash
pm2 start "npm run start" --name minchev-site
pm2 save                # запомнить список процессов
pm2 startup             # выведет команду — скопируйте и выполните её (автозапуск после ребута)
```

Проверка, что приложение живо:

```bash
curl http://localhost:3000   # должна вернуться HTML-разметка
pm2 logs minchev-site        # логи (Ctrl+C для выхода)
```

---

## 5. Nginx как reverse proxy

Создайте конфиг сайта:

```bash
sudo nano /etc/nginx/sites-available/minchev
```

```nginx
server {
    listen 80;
    server_name ВАШ_ДОМЕН.ru www.ВАШ_ДОМЕН.ru;

    # Важно: форма принимает файлы до 10 МБ — поднимаем лимит тела запроса
    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> `client_max_body_size 15M` критично: без него Nginx обрежет загрузку чертежа/фото
> на ~1 МБ и до приложения файл не дойдёт (это та же по сути проблема, что мы
> чинили в `next.config.mjs`, но уже на уровне веб-сервера).
> `X-Forwarded-For` нужен, чтобы в письме корректно фиксировался IP для согласия на ПДн.

Активируйте конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/minchev /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t          # проверка синтаксиса
sudo systemctl reload nginx
```

---

## 6. Домен и HTTPS (SSL)

1. В панели вашего регистратора домена создайте **A-запись**, указывающую на IP вашего VPS
   (и `www`, если нужно). Подождите, пока DNS обновится (от минут до пары часов).

2. Установите бесплатный сертификат Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ВАШ_ДОМЕН.ru -d www.ВАШ_ДОМЕН.ru
```

Certbot сам пропишет HTTPS в конфиг Nginx и настроит автопродление.
Проверьте автопродление:

```bash
sudo certbot renew --dry-run
```

Готово — сайт доступен по `https://ВАШ_ДОМЕН.ru`.

---

## 7. Проверка после деплоя

1. Откройте сайт по HTTPS, убедитесь, что страница и галерея грузятся.
2. **Отправьте тестовую заявку с файлом ~5–8 МБ** (jpg/pdf/dwg).
3. Проверьте, что:
   - письмо с вложением пришло на `EMAIL_TO`;
   - сообщение пришло в Telegram;
   - модалка «Заявка отправлена» закрылась.

Если письмо не пришло — смотрите логи: `pm2 logs minchev-site`.

---

## 8. Обновление сайта в будущем

```bash
cd ~/my-app
git pull               # или заново скопируйте изменённые файлы через scp
npm ci
npm run build
pm2 restart minchev-site
```

---

## Шпаргалка по эксплуатации

| Действие                     | Команда                          |
|------------------------------|----------------------------------|
| Статус процесса              | `pm2 status`                     |
| Логи приложения              | `pm2 logs minchev-site`          |
| Перезапуск                   | `pm2 restart minchev-site`       |
| Остановка                    | `pm2 stop minchev-site`          |
| Перезагрузка Nginx           | `sudo systemctl reload nginx`    |
| Проверить конфиг Nginx       | `sudo nginx -t`                  |
