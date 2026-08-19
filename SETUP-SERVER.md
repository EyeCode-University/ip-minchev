# С нуля: от вашего компьютера до работающего сайта

Пошаговая установка сайта **ИП Минчев Р.М.** на чистый VPS Timeweb Cloud.
Делать всё подряд, сверху вниз. Каждый шаг заканчивается проверкой — если проверка
не прошла, дальше не идём.

**Что получится в итоге:** сайт работает в Docker-контейнере под управлением
`docker compose`, снаружи стоит Nginx с HTTPS, автозапуск после перезагрузки сервера.
После этого можно включить автодеплой — [CI-CD.md](CI-CD.md).

**Обозначения:**
- 💻 — команда выполняется **на вашем компьютере** (PowerShell)
- 🖥 — команда выполняется **на сервере** (в SSH-сессии)
- `ВАШ_IP` — IP-адрес сервера из панели Timeweb, `ВАШ_ДОМЕН.ru` — ваш домен

---

## Шаг 0. Что подготовить заранее

1. **IP и root-пароль сервера** — панель Timeweb Cloud, карточка сервера. При
   создании сервера выбирайте **Ubuntu 24.04**, минимум **2 vCPU / 2 ГБ RAM / 20 ГБ**.
2. **Секреты** — они у вас уже есть в локальном файле `.env.local`:
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_TO`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
3. **Домен** (опционально на старте) — сайт сначала поднимется по IP, домен
   прикрутим на шаге 9.

### 0.1 Убедиться, что весь код в GitHub

Сервер будет забирать код из репозитория, поэтому локальные изменения нужно
запушить. 💻

```powershell
cd "d:\Desktop\M A I N\Business\ip_minchev\my-app"
git status                 # должно быть чисто, либо коммитим:
git add -A
git commit -m "CI/CD и инструкции по деплою"
git push
```

> `.env.local` и папка `secrets/` в git не попадут — они в `.gitignore`. Это правильно:
> секреты мы перенесём на сервер отдельно, руками.

---

## Шаг 1. Первый вход на сервер

💻 В PowerShell:

```powershell
ssh root@ВАШ_IP
```

Первый раз спросит `Are you sure you want to continue connecting?` — отвечаем `yes`.
Затем вводим root-пароль из панели Timeweb (при вводе пароль **не отображается**, это норма).

Сменим root-пароль на свой. 🖥

```bash
passwd
```

Обновим систему и поставим базовые пакеты. 🖥

```bash
apt update && apt upgrade -y
apt install -y curl git nginx ufw
```

> Если во время обновления появится синий экран с вопросом про перезапуск сервисов —
> нажмите `Tab` → `Ok` → `Enter`.

**Проверка:** `nginx -v` печатает версию.

---

## Шаг 2. Firewall

🖥 Открываем только SSH и веб-порты, остальное закрыто:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'     # это 80 и 443
ufw --force enable
ufw status
```

**Проверка:** в выводе `ufw status` есть строки `OpenSSH` и `Nginx Full` со статусом `ALLOW`.
Откройте в браузере `http://ВАШ_IP` — увидите страницу «Welcome to nginx!».

---

## Шаг 3. Пользователь `deploy` и вход по ключу

Работать под root и пускать под root автодеплой — плохая идея. Заводим отдельного
пользователя. 🖥

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
```

Теперь SSH-ключ. Генерируем его **у себя на компьютере** (он же потом пойдёт в GitHub Actions). 💻

```powershell
ssh-keygen -t ed25519 -C "minchev-deploy" -f $env:USERPROFILE\.ssh\minchev_deploy -N '""'
```

Появятся два файла: `minchev_deploy` (приватный — никому!) и `minchev_deploy.pub` (публичный).

Публичный кладём на сервер пользователю `deploy` одной командой. 💻

```powershell
type $env:USERPROFILE\.ssh\minchev_deploy.pub | ssh root@ВАШ_IP "mkdir -p /home/deploy/.ssh && cat >> /home/deploy/.ssh/authorized_keys && chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys"
```

**Проверка** — заходим под `deploy` без пароля. 💻

```powershell
ssh -i $env:USERPROFILE\.ssh\minchev_deploy deploy@ВАШ_IP "whoami"
```

Должно напечатать `deploy`.

> Чтобы каждый раз не писать `-i ...`, добавьте в `%USERPROFILE%\.ssh\config`:
>
> ```
> Host minchev
>     HostName ВАШ_IP
>     User deploy
>     IdentityFile ~/.ssh/minchev_deploy
> ```
>
> После этого достаточно `ssh minchev`.

Заодно задайте `deploy` пароль — он понадобится для команд с `sudo`. 🖥 из root-сессии:

```bash
passwd deploy
```

---

## Шаг 4. Docker

🖥 Из **root**-сессии:

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
systemctl enable --now docker
```

Группа `docker` применяется только при новом входе — выходим и заходим заново под `deploy`. 💻

```powershell
exit                                    # выйти из ssh-сессии
ssh -i $env:USERPROFILE\.ssh\minchev_deploy deploy@ВАШ_IP
```

**Проверка:** 🖥

```bash
docker run --rm hello-world
docker compose version
```

Первая команда печатает «Hello from Docker!», вторая — версию v2.x.

### 4.1 Swap (если на сервере 2 ГБ RAM)

Сборка Next.js прожорлива, без swap может упасть с `Killed`. 🖥 из root-сессии:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h        # в строке Swap должно быть 2.0Gi
```

---

## Шаг 5. Код на сервер

🖥 Под пользователем `deploy`:

```bash
cd ~
git clone https://github.com/EyeCode-University/ip-minchev.git app
cd app
ls
```

**Если репозиторий приватный** и clone попросил логин/пароль — нужен deploy-ключ:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github -N ""
cat ~/.ssh/github.pub
```

Скопируйте вывод → GitHub → репозиторий → **Settings → Deploy keys → Add deploy key**
(галку «Allow write access» **не** ставим). Затем:

```bash
cd ~
git clone git@github.com:EyeCode-University/ip-minchev.git app
cd app
```

**Проверка:** `ls` показывает `Dockerfile`, `docker-compose.yml`, `package.json`, `src`.

---

## Шаг 6. Секреты (`.env`)

Файл `.env` создаётся **только на сервере** и никогда не коммитится. 🖥

```bash
cd ~/app
cp .env.docker.example .env
nano .env
```

Заполните реальными значениями из вашего локального `.env.local`:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=почта@yandex.ru
SMTP_PASSWORD=пароль_приложения_яндекса
EMAIL_TO=почта@yandex.ru

TELEGRAM_BOT_TOKEN=токен_бота
TELEGRAM_CHAT_ID=id_чата
```

Сохранить: `Ctrl+O` → `Enter` → `Ctrl+X`. Закрыть от посторонних:

```bash
chmod 600 .env
```

> `SMTP_PASSWORD` — это **пароль приложения** Яндекса (Яндекс ID → Безопасность →
> Пароли приложений → Почта), а не пароль от ящика. Обычный пароль SMTP не примет.

**Проверка:** `cat .env` — все семь переменных заполнены, плейсхолдеров вида
`ваш_токен` не осталось.

---

## Шаг 7. Первый запуск

🖥

```bash
cd ~/app
docker compose up -d --build
```

Первая сборка идёт 3–7 минут (скачивается `node:20-alpine`, ставятся зависимости,
собирается Next.js). Дальнейшие сборки быстрее за счёт кэша слоёв.

**Проверка:** 🖥

```bash
docker compose ps                 # State: running (healthy)
curl -I http://127.0.0.1:3000     # HTTP/1.1 200 OK
```

Если контейнер не поднялся — смотрим причину: `docker compose logs --tail=50 web`.

> Порт 3000 намеренно опубликован только на `127.0.0.1` — снаружи он недоступен,
> и это правильно: наружу смотрит Nginx.

---

## Шаг 8. Nginx как reverse proxy

🖥 Из root-сессии (или через `sudo`):

```bash
nano /etc/nginx/sites-available/minchev
```

Вставьте (если домена ещё нет — в `server_name` поставьте IP сервера):

```nginx
server {
    listen 80;
    server_name ВАШ_ДОМЕН.ru www.ВАШ_ДОМЕН.ru;

    # Форма принимает чертежи до 10 МБ. Без этой строки Nginx обрежет
    # загрузку на ~1 МБ и файл до приложения не дойдёт.
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

Активируем и убираем дефолтный конфиг:

```bash
ln -sf /etc/nginx/sites-available/minchev /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

**Проверка:** откройте `http://ВАШ_IP` в браузере — должен открыться сайт, а не
страница Nginx.

---

## Шаг 9. Домен и HTTPS

1. У регистратора домена создайте **A-записи**:
   - `@` → `ВАШ_IP`
   - `www` → `ВАШ_IP`

   DNS обновляется от нескольких минут до пары часов. Проверить 💻:

   ```powershell
   nslookup ВАШ_ДОМЕН.ru
   ```

   Должен вернуться IP вашего сервера. Пока не вернулся — сертификат ставить рано.

2. Сертификат Let's Encrypt. 🖥 из root:

   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d ВАШ_ДОМЕН.ru -d www.ВАШ_ДОМЕН.ru
   ```

   Certbot спросит email, согласие с условиями и предложит редирект HTTP→HTTPS —
   выбирайте **редирект**. Конфиг Nginx он поправит сам.

3. Автопродление уже настроено таймером systemd. Проверить:

   ```bash
   certbot renew --dry-run
   ```

**Проверка:** `https://ВАШ_ДОМЕН.ru` открывается с замком в адресной строке,
`http://` автоматически перекидывает на `https://`.

---

## Шаг 10. Боевая проверка формы

Это главный шаг — весь сайт существует ради заявок.

1. Откройте сайт по HTTPS, пролистайте: галерея грузится, карта России рисуется.
2. Заполните форму заявки и приложите **реальный файл 5–8 МБ** (jpg / pdf / dwg).
3. Убедитесь, что:
   - появилась модалка «Заявка отправлена»;
   - письмо с вложением пришло на `EMAIL_TO`;
   - сообщение пришло в Telegram.

Если письмо не пришло — 🖥 `docker compose logs --tail=100 web` и ищите ошибку SMTP.
Самое частое: в `SMTP_PASSWORD` вписан пароль от ящика вместо пароля приложения.

---

## Шаг 11. Включить автодеплой

Ручной деплой работает — теперь автоматизируем. Открывайте [CI-CD.md](CI-CD.md)
и делайте **шаг 4** (пять секретов в GitHub) и **шаг 6** (push).

Шаги 1–3 из CI-CD.md вы уже прошли здесь: сервер настроен, пользователь `deploy`
создан, ключ `minchev_deploy` сгенерирован. Для секрета `SSH_KEY` нужен приватный
ключ целиком: 💻

```powershell
Get-Content $env:USERPROFILE\.ssh\minchev_deploy | Set-Clipboard
```

Значения секретов: `SSH_HOST` = `ВАШ_IP`, `SSH_PORT` = `22`, `SSH_USER` = `deploy`,
`APP_DIR` = `/home/deploy/app`.

После этого любой `git push` в `master` сам выкатывает изменения на сайт.

---

## Шпаргалка по эксплуатации

Все команды — 🖥 в каталоге `~/app` под пользователем `deploy`.

| Действие | Команда |
|---|---|
| Статус контейнера | `docker compose ps` |
| Логи приложения | `docker compose logs -f web` |
| Перезапуск | `docker compose restart web` |
| Обновить вручную | `git pull && docker compose up -d --build` |
| Поменять секреты | `nano .env && docker compose up -d` |
| Место на диске | `df -h` и `docker system df` |
| Почистить старые образы | `docker system prune -af` |
| Конфиг Nginx | `sudo nginx -t && sudo systemctl reload nginx` |
| Логи Nginx | `sudo tail -f /var/log/nginx/error.log` |

---

## Если что-то пошло не так

| Симптом | Причина и лечение |
|---|---|
| `Permission denied (publickey)` при входе | Ключ не долетел до сервера. Повторите шаг 3, проверьте права: `ls -la /home/deploy/.ssh` — каталог `700`, `authorized_keys` `600`, владелец `deploy`. |
| `permission denied` на `docker ...` | Не применилась группа docker — выйдите из SSH и зайдите заново (шаг 4). |
| Сборка падает с `Killed` / `heap out of memory` | Мало RAM. Включите swap — шаг 4.1. |
| Сайт открывается, но форма отвечает ошибкой | Смотрите `docker compose logs --tail=100 web`: обычно SMTP-пароль или неверный `TELEGRAM_CHAT_ID`. |
| Файл >1 МБ не прикрепляется, ошибка 413 | В конфиге Nginx нет `client_max_body_size 15M` (шаг 8). После правки — `sudo nginx -t && sudo systemctl reload nginx`. |
| Правки в `.env` не подхватились | `env_file` читается при создании контейнера: нужен `docker compose up -d`, а не `restart`. |
| Certbot: `Timeout during connect` | DNS ещё не обновился или закрыт 80-й порт. Проверьте `nslookup` и `ufw status`. |
| 502 Bad Gateway в браузере | Контейнер лежит. `docker compose ps` и `docker compose logs --tail=50 web`. |
