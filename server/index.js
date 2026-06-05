const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(cors({ origin: true }));
app.options('*', cors({ origin: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});
app.use(bodyParser.json());

// Config via env
const PORT = process.env.PORT || 3001;
const TARGET_NUMBER = process.env.WHATSAPP_NUMBER || '256778597244'; // digits only, e.g. 256778597244

if (!TARGET_NUMBER) {
  console.warn('WARNING: WHATSAPP_NUMBER not set. Set env WHATSAPP_NUMBER to the recipient phone (digits only).');
}

// Use LocalAuth to persist session in ./session
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'adlite' }),
  puppeteer: { headless: true }
});

client.on('qr', (qr) => {
  console.log('Scan this QR with your WhatsApp to authenticate the microservice:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client ready');
});

client.on('authenticated', () => {
  console.log('Authenticated with WhatsApp and session saved.');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
});

client.initialize();

function formatPhone(digits) {
  const cleaned = (digits || '').replace(/[^0-9]/g, '');
  if (!cleaned) return null;
  // whatsapp-web.js expects number@c.us
  return `${cleaned}@c.us`;
}

app.post('/submit', async (req, res) => {
  const data = req.body || {};

  const numberId = formatPhone(process.env.WHATSAPP_NUMBER || TARGET_NUMBER);
  if (!numberId) {
    return res.status(400).json({ ok: false, error: 'WHATSAPP_NUMBER not configured' });
  }

  // Build a human-friendly message
  const lines = [];
  lines.push('*New Campaign Request*');
  if (data.package) lines.push(`*Package:* ${data.package}`);
  if (data.areas) lines.push(`*Areas:* ${data.areas}`);
  if (data.fullName) lines.push(`*Name:* ${data.fullName}`);
  if (data.email) lines.push(`*Email:* ${data.email}`);
  if (data.phone) lines.push(`*Phone:* ${data.phone}`);
  if (data.companyName) lines.push(`*Company:* ${data.companyName}`);
  if (data.companyWebsite) lines.push(`*Website:* ${data.companyWebsite}`);
  if (data.notes) lines.push(`*Notes:* ${data.notes}`);
  lines.push(`_Received at ${new Date().toLocaleString()}_
`);

  const message = lines.join('\n');

  try {
    const msg = await client.sendMessage(numberId, message);
    return res.json({ ok: true, id: msg.id._serialized });
  } catch (err) {
    console.error('sendMessage error', err && err.message);
    return res.status(500).json({ ok: false, error: err && err.message });
  }
});

app.get('/', (req, res) => res.send('AdLite WhatsApp microservice running'));

app.listen(PORT, () => console.log(`Microservice listening on http://localhost:${PORT}`));
