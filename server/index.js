const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── SETTINGS ────────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || 'YOUR_CHAT_ID';
const PORT               = process.env.PORT || 3000;
const DB_FILE            = path.join(__dirname, 'events.json');
// ─────────────────────────────────────────────────────────────

// Load saved events
function loadEvents() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

// Save event
function saveEvent(event) {
  const events = loadEvents();
  events.push(event);
  fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
}

// Send Telegram notification
async function notifyTelegram(event) {
  const emoji = event.type === 'click' ? '🎣' : '👁️';
  const action = event.type === 'click' ? 'clicked the link' : 'opened the email';

  const text =
    `${emoji} *Phishing Simulator — triggered!*\n\n` +
    `👤 Employee: *${event.name}*\n` +
    `📧 Email: ${event.email}\n` +
    `🔔 Action: ${action}\n` +
    `🕐 Time: ${new Date(event.time).toLocaleString('en-US')}\n` +
    `🌐 IP: ${event.ip}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.error('Telegram error:', e.message);
  }
}

// ─── ROUTES ───────────────────────────────────────────────────

// Pixel — fires when email is opened
app.get('/open', async (req, res) => {
  const { id, name, email } = req.query;

  const event = {
    id,
    name: decodeURIComponent(name || 'Unknown'),
    email: decodeURIComponent(email || ''),
    type: 'open',
    ip: req.headers['x-forwarded-for'] || req.ip,
    userAgent: req.headers['user-agent'],
    time: new Date().toISOString()
  };

  saveEvent(event);
  await notifyTelegram(event);
  console.log(`👁️  Opened email: ${event.name} (${event.email})`);

  // Return transparent 1x1 GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.set('Content-Type', 'image/gif');
  res.set('Cache-Control', 'no-store');
  res.send(pixel);
});

// Link — fires when clicked
app.get('/click', async (req, res) => {
  const { id, name, email } = req.query;

  const event = {
    id,
    name: decodeURIComponent(name || 'Unknown'),
    email: decodeURIComponent(email || ''),
    type: 'click',
    ip: req.headers['x-forwarded-for'] || req.ip,
    userAgent: req.headers['user-agent'],
    time: new Date().toISOString()
  };

  saveEvent(event);
  await notifyTelegram(event);
  console.log(`🎣 Clicked: ${event.name} (${event.email})`);

  // Show awareness page (training)
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Warning!</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 80px auto; padding: 20px; text-align: center; }
        .box { background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 40px; }
        h1 { color: #856404; }
        p { color: #555; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>⚠️ This was a phishing test</h1>
        <p>You clicked on a suspicious link from an email.</p>
        <p>In a real situation, this could have led to data theft or malware infection.</p>
        <p><strong>Always verify the sender and links before clicking!</strong></p>
      </div>
    </body>
    </html>
  `);
});

// API for dashboard
app.get('/api/events', (req, res) => {
  res.json(loadEvents());
});

// Dashboard
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));

app.get('/', (req, res) => {
  res.send('Phishing Simulator is running ✅');
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});
