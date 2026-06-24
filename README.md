# 🎣 Phishing Simulator

A corporate phishing simulator for employee security awareness training.

---

## Project Structure

```
phishing-simulator/
├── server/
│   ├── index.js      ← main server
│   └── send.js       ← email sender
├── dashboard/
│   └── index.html    ← web dashboard
├── employees.csv     ← employee list
├── package.json
└── railway.toml      ← Railway config
```

---

## Step 1 — Create a Telegram Bot

1. Open @BotFather in Telegram
2. Send `/newbot`
3. Give your bot a name and receive a **token** (looks like: `123456:ABC-DEF...`)
4. Send `/start` to your bot
5. Open in a browser:
   `https://api.telegram.org/botYOUR_TOKEN/getUpdates`
6. Find `"chat":{"id":XXXXXXXXX}` — this is your **Chat ID**

---

## Step 2 — Deploy to Railway

1. Go to [railway.app](https://railway.app) → sign in with GitHub
2. New Project → Deploy from GitHub repo → select this repository
3. Add the following environment variables in the project settings:

```
TELEGRAM_BOT_TOKEN = your token from BotFather
TELEGRAM_CHAT_ID   = your chat_id
PORT               = 3000
```

4. Railway will automatically assign a URL like: `https://your-project.railway.app`

---

## Step 3 — Prepare the Employee List

Edit `employees.csv`:

```csv
name,email
John Smith,john@company.com
Jane Doe,jane@company.com
```

---

## Step 4 — Configure Email Sending

Add the following environment variables:

```
SERVER_URL     = https://your-project.railway.app
SMTP_HOST      = smtp.gmail.com
SMTP_PORT      = 587
SMTP_USER      = you@gmail.com
SMTP_PASS      = your Gmail app password
FROM_NAME      = IT Department
EMAIL_SUBJECT  = Important: confirm access to your account
```

> **For Gmail:** enable two-factor authentication,
> then create an "App Password" in your security settings.

---

## Step 5 — Send the Emails

```bash
npm install
node server/send.js employees.csv
```

---

## Dashboard

After deploying, open:
`https://your-project.railway.app/dashboard`

The dashboard auto-refreshes every 5 seconds.

---

## How It Works

```
Employee opens the email
        ↓
Email client loads an invisible 1x1 pixel
        ↓
Your server receives the request → logs an "open" event
        ↓
Telegram bot sends a notification

Employee clicks the link
        ↓
Server logs a "click" event → Telegram notification
        ↓
Employee is shown an awareness page explaining the test
```

---

⚠️ **Use only with written permission from company management**
