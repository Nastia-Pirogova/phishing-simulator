# 🎣 Phishing Simulator

Корпоративный симулятор фишинга для обучения сотрудников.

---

## Структура проекта

```
phishing-simulator/
├── server/
│   ├── index.js      ← основной сервер
│   └── send.js       ← рассылка писем
├── dashboard/
│   └── index.html    ← веб-дашборд
├── employees.csv     ← список сотрудников
├── package.json
└── railway.toml      ← конфиг для Railway
```

---

## Шаг 1 — Создать Telegram бота

1. Открыть @BotFather в Telegram
2. Написать `/newbot`
3. Дать имя боту, получить **токен** (выглядит так: `123456:ABC-DEF...`)
4. Написать боту `/start`
5. Открыть в браузере:
   `https://api.telegram.org/botВАШ_ТОКЕН/getUpdates`
6. Найти `"chat":{"id":XXXXXXXXX}` — это ваш **Chat ID**

---

## Шаг 2 — Задеплоить на Railway

1. Зайти на [railway.app](https://railway.app) → войти через GitHub
2. New Project → Deploy from GitHub repo → выбрать этот репозиторий
3. В настройках проекта добавить переменные окружения:

```
TELEGRAM_BOT_TOKEN = ваш токен от BotFather
TELEGRAM_CHAT_ID   = ваш chat_id
PORT               = 3000
```

4. Railway автоматически даст URL вида: `https://ваш-проект.railway.app`

---

## Шаг 3 — Подготовить список сотрудников

Отредактируйте `employees.csv`:

```csv
name,email
Иван Петров,ivan@company.com
Мария Сидорова,maria@company.com
```

---

## Шаг 4 — Настроить рассылку

Добавить переменные для отправки писем:

```
SERVER_URL     = https://ваш-проект.railway.app
SMTP_HOST      = smtp.gmail.com
SMTP_PORT      = 587
SMTP_USER      = вы@gmail.com
SMTP_PASS      = пароль приложения Gmail
FROM_NAME      = IT Отдел
EMAIL_SUBJECT  = Важно: подтвердите доступ к аккаунту
```

> **Для Gmail:** включите двухфакторную аутентификацию,
> затем создайте "Пароль приложения" в настройках безопасности.

---

## Шаг 5 — Запустить рассылку

```bash
npm install
node server/send.js employees.csv
```

---

## Дашборд

После деплоя откройте:
`https://ваш-проект.railway.app/dashboard`

Дашборд обновляется автоматически каждые 5 секунд.

---

## Как это работает

```
Сотрудник открывает письмо
        ↓
Outlook/почтовый клиент загружает невидимый пиксель 1x1
        ↓
Ваш сервер получает запрос → записывает событие "open"
        ↓
Telegram бот присылает уведомление

Сотрудник кликает ссылку
        ↓
Сервер записывает событие "click" → Telegram уведомление
        ↓
Сотруднику показывается страница с объяснением теста
```

---

⚠️ **Использовать только с письменного разрешения руководства компании**
