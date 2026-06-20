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

const distributionDataFile = path.join(__dirname, 'distribution-data.json');
let distributionReports = [];

const loadDistributionData = () => {
  try {
    distributionReports = JSON.parse(fs.readFileSync(distributionDataFile, 'utf8')) || [];
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Unable to load distribution data:', err);
    }
    distributionReports = [];
  }
};

const saveDistributionData = () => {
  try {
    fs.writeFileSync(distributionDataFile, JSON.stringify(distributionReports, null, 2), 'utf8');
  } catch (err) {
    console.error('Unable to save distribution data:', err);
  }
};

const aggregateDistributionByArea = (reports) => {
  const areaMap = {};
  reports.forEach((report) => {
    const key = String(report.area || '').trim() || 'Unknown';
    const bags = Number(report.bags) || 0;
    if (!areaMap[key]) {
      areaMap[key] = { name: key, bags: 0, reports: 0 };
    }
    areaMap[key].bags += bags;
    areaMap[key].reports += 1;
  });
  return Object.values(areaMap);
};

loadDistributionData();

// Config via env
const PORT = process.env.PORT || 3001;
const TARGET_NUMBER = process.env.WHATSAPP_NUMBER || '256778597244'; // digits only, e.g. 256778597244

if (!TARGET_NUMBER) {
  console.warn('WARNING: WHATSAPP_NUMBER not set. Set env WHATSAPP_NUMBER to the recipient phone (digits only).');
}

// Use LocalAuth to persist session in ./session
const chromeExecutableCandidates = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
].filter(Boolean);

const resolvedChromeExecutable = chromeExecutableCandidates.find((candidatePath) => fs.existsSync(candidatePath));
const puppeteerConfig = { headless: true };
if (resolvedChromeExecutable) {
  puppeteerConfig.executablePath = resolvedChromeExecutable;
} else {
  console.warn('WARNING: No local Chrome executable found. Set PUPPETEER_EXECUTABLE_PATH or CHROME_PATH if startup fails.');
}
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'adlite' }),
  puppeteer: puppeteerConfig
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

app.get('/distribution', (req, res) => {
  const totals = aggregateDistributionByArea(distributionReports);
  return res.json({ ok: true, reports: distributionReports, totals });
});

app.post('/distribution', async (req, res) => {
  const data = req.body || {};
  const area = String(data.area || '').trim();
  const bags = Number(data.bags);
  const date = data.date ? String(data.date).trim() : '';
  const notes = data.notes ? String(data.notes).trim() : '';

  if (!area || !Number.isFinite(bags) || bags <= 0) {
    return res.status(400).json({ ok: false, error: 'Area and bags are required. Bags must be a positive number.' });
  }

  const report = {
    area,
    bags,
    date: date || new Date().toISOString().slice(0, 10),
    notes,
    createdAt: new Date().toISOString()
  };

  distributionReports.push(report);
  saveDistributionData();

  const numberId = formatPhone(process.env.WHATSAPP_NUMBER || TARGET_NUMBER);
  const lines = [
    '*New Distribution Report*',
    `*Area:* ${report.area}`,
    `*Bags distributed:* ${report.bags}`,
    `*Date:* ${report.date}`
  ];
  if (report.notes) lines.push(`*Notes:* ${report.notes}`);
  lines.push(`_Reported at ${new Date().toLocaleString()}_`);

  const message = lines.join('\n');
  if (numberId) {
    try {
      await client.sendMessage(numberId, message);
    } catch (err) {
      console.error('send distribution report to WhatsApp failed', err && err.message);
    }
  }

  return res.json({ ok: true, report, totals: aggregateDistributionByArea(distributionReports) });
});

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
