require('dotenv').config();

const nodemailer = require('nodemailer');
const fs = require('fs');
const {parse} = require('csv-parse/sync');

// ─── SETTINGS ────────────────────────────────────────────────
const SERVER_URL = process.env.SERVER_URL || 'https://YOUR-PROJECT.railway.app';

const SMTP = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || 'you@gmail.com',
    pass: process.env.SMTP_PASS || 'YOUR_PASSWORD',
};

const FROM_NAME = process.env.FROM_NAME || 'IT Department';
const FROM_EMAIL = process.env.SMTP_USER || 'it@company.com';
const SUBJECT = process.env.EMAIL_SUBJECT || 'Important: confirm access to your corporate account';
// ─────────────────────────────────────────────────────────────

// Read CSV file
function loadEmployees(csvPath) {
    const content = fs.readFileSync(csvPath, 'utf-8');
    return parse(content, {columns: true, skip_empty_lines: true});
}

// Generate unique token for employee
function makeToken(email) {
    return Buffer.from(email + Date.now()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

// HTML email with tracking pixel and link
function makeEmailHtml(employee, trackId) {
    const nameEnc = encodeURIComponent(employee.name);
    const emailEnc = encodeURIComponent(employee.email);
    const openUrl = `${SERVER_URL}/open?id=${trackId}&name=${nameEnc}&email=${emailEnc}`;
    const clickUrl = `${SERVER_URL}/click?id=${trackId}&name=${nameEnc}&email=${emailEnc}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <p>Hello, <strong>${employee.name}</strong>!</p>

  <p>As part of a scheduled security system update, you are required to confirm your access
  to the corporate portal by <strong>${getDeadline()}</strong>.</p>

  <p>If you do not confirm, access to your corporate email and systems will be temporarily suspended.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${clickUrl}"
       style="background: #0066cc; color: white; padding: 14px 32px;
              text-decoration: none; border-radius: 6px; font-size: 16px;">
      Confirm Access
    </a>
  </div>

  <p style="color: #888; font-size: 12px;">
    If you have any questions, please contact the IT department.<br>
    Regards, Information Security Team
  </p>

  <!-- Open tracking pixel -->
  <img src="${openUrl}" width="1" height="1" style="display:none;" alt="">

</body>
</html>`;
}

function getDeadline() {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-US', {day: 'numeric', month: 'long'});
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── MAIN FUNCTION ────────────────────────────────────────────
async function sendAll() {
    const csvPath = process.argv[2] || 'employees.csv';

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ File not found: ${csvPath}`);
        console.log('Usage: node send.js employees.csv');
        process.exit(1);
    }

    const employees = loadEmployees(csvPath);
    console.log(`📋 Employees loaded: ${employees.length}`);

    const transporter = nodemailer.createTransport({
        host: SMTP.host,
        port: SMTP.port,
        secure: SMTP.port === 465,
        auth: {user: SMTP.user, pass: SMTP.pass}
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful\n');

    let sent = 0, failed = 0;

    for (const emp of employees) {
        try {
            const token = makeToken(emp.email);
            const html = makeEmailHtml(emp, token);

            await transporter.sendMail({
                from: `"${FROM_NAME}" <'sumy@sm.gov.ua'>`,
                to: emp.email,
                subject: SUBJECT,
                html
            });

            console.log(`✅ [${++sent}/${employees.length}] ${emp.name} <${emp.email}>`);
            await sleep(500); // pause between emails
        } catch (e) {
            console.error(`❌ Failed for ${emp.email}: ${e.message}`);
            failed++;
        }
    }

    console.log(`\n📊 Summary: sent ${sent}, failed ${failed}`);
}

sendAll().catch(console.error);
