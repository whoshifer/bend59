# DEPLOY — Render: сайт bend59 + база bend59-db

## Что получим
Сайт на `https://bend59.onrender.com` + PostgreSQL. Поднимается из `render.yaml` (Blueprint) за ~10 минут.

## Шаг 1. Код на GitHub

```bash
cd "D:\coding\КЕША ПРОЕКТЫ\BEND59\bend-next"
git init   # если ещё не инициализирован
git add -A
git commit -m "BEND: каталог с фото, корзина КП, уведомления, SEO"
```

Создай пустой приватный репозиторий на github.com (например `bend59`), затем:

```bash
git remote add origin https://github.com/<твой-ник>/bend59.git
git push -u origin main
```

## Шаг 2. Render — Blueprint

1. https://dashboard.render.com → **New +** → **Blueprint**
2. Выбери репозиторий `bend59` → **Connect**
3. Render прочитает `render.yaml` и покажет 2 сервиса: `bend59-db` (PostgreSQL) и `bend59` (Node)
4. Перед **Apply** заполни переменные:
   - `ADMIN_EMAIL` — логин в админку (например `bend.admin@mail.ru`)
   - `ADMIN_PASSWORD` — пароль админки, минимум 12 символов
   - `SITE_URL` — пока оставь пустым, впишешь после первого деплоя
5. **Apply** → жди сборку (~5–10 минут)

## Шаг 3. Проверка

- `https://bend59.onrender.com/` — главная, каталог с фото
- Добавь 2–3 позиции в КП, перезагрузи страницу — состав должен остаться
- Отправь тестовую заявку → зайди в `/admin` (ADMIN_EMAIL / ADMIN_PASSWORD) → раздел «Заявки»
- `AUTH_SECRET` Render сгенерирует сам

## Шаг 4. После первого деплоя

- Render → сервис `bend59` → **Environment** → `SITE_URL=https://bend59.onrender.com`
  (это включает canonical, OG-картинку, sitemap с правильным доменом) → **Save** → автодеплой
- **Custom Domains** — привязать `bend59.ru`: в Reg.ru сменить A-запись на IP из Render (или CNAME для subdomain). HTTPS-сертификат Render выдаёт сам

## Уведомления о заявках (Telegram / почта)

Заявки всегда сохраняются в админку. Чтобы дублировались в Telegram/на почту, добавь в **Environment** сервиса `bend59`:

**Telegram:**
- `TELEGRAM_BOT_TOKEN` — создай бота у @BotFather → /newbot → токен
- `TELEGRAM_CHAT_ID` — напиши боту любое сообщение, открой `https://api.telegram.org/bot<ТОКЕН>/getUpdates`, возьми `chat.id`

**Почта (SMTP, например mail.ru):**
- `SMTP_HOST=smtp.mail.ru`, `SMTP_PORT=465`
- `SMTP_USER` / `SMTP_PASS` — почтовый ящик и «пароль приложения» (в настройках почты mail.ru)
- `NOTIFY_EMAIL_TO` — куда слать (по умолчанию = SMTP_USER)

После добавления переменных → Manual Deploy.

## ⚠️ Ограничения бесплатного тарифа Render

1. **PostgreSQL free живёт 30 дней**, потом база удаляется — для продакшена апгрейд ($6/мес) или внешняя БД (Neon — бесплатная постоянная).
2. **Сайт засыпает после 15 мин без посещений**, первый запрос ~50 сек.
3. Фото из админки живут до пересборки (эфемерный диск). Серийные фото уже в репозитории — они постоянные.

## Обновления

Любой `git push` в main → Render пересобирает сам. Миграции и сид применяются при старте идемпотентно: контент, заявки и медиа не затираются.
