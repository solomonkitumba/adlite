const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { cleanText, validateDistributionPayload } = require('./validation');

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8080,http://localhost:3001')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(bodyParser.json({ limit: '32kb' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ ok: false, error: 'Request body is too large.' });
  if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, 'body')) {
    return res.status(400).json({ ok: false, error: 'Request body must be valid JSON.' });
  }
  return next(err);
});
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const requestCounts = new Map();
const rateLimit = (windowMs, maxRequests) => (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = requestCounts.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    requestCounts.set(key, { startedAt: now, count: 1 });
    return next();
  }
  current.count += 1;
  if (current.count > maxRequests) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }
  return next();
};

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
  const temporaryFile = `${distributionDataFile}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, JSON.stringify(distributionReports, null, 2), 'utf8');
    fs.renameSync(temporaryFile, distributionDataFile);
  } catch (err) {
    console.error('Unable to save distribution data:', err);
    try { if (fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile); } catch (_) { /* preserve original error */ }
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
const TARGET_NUMBER = cleanText(process.env.WHATSAPP_NUMBER, 30).replace(/[^0-9]/g, '');
if (!TARGET_NUMBER) console.warn('WARNING: WHATSAPP_NUMBER is not configured. WhatsApp submissions are disabled.');

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
let whatsappReady = false;

client.on('qr', (qr) => {
  console.log('Scan this QR with your WhatsApp to authenticate the microservice:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  whatsappReady = true;
  console.log('WhatsApp client ready');
});

client.on('authenticated', () => {
  console.log('Authenticated with WhatsApp and session saved.');
});

client.on('auth_failure', (msg) => {
  whatsappReady = false;
  console.error('Authentication failure:', msg);
});

client.on('disconnected', () => { whatsappReady = false; });
client.initialize().catch((err) => console.error('WhatsApp client initialization failed:', err.message));

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

app.post('/distribution', rateLimit(60000, 30), async (req, res) => {
  const authHeader = req.get('authorization') || '';
  const expectedToken = process.env.DISTRIBUTION_WRITE_TOKEN;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ ok: false, error: 'Distribution write access is not authorized.' });
  }

  const parsed = validateDistributionPayload(req.body);
  if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
  const { area, bags, date, notes } = parsed.value;

  const report = {
    area,
    bags,
    date: date || new Date().toISOString().slice(0, 10),
    notes,
    createdAt: new Date().toISOString()
  };

  distributionReports.push(report);
  saveDistributionData();

  const numberId = formatPhone(TARGET_NUMBER);
  const lines = [
    '*New Distribution Report*',
    `*Area:* ${report.area}`,
    `*Bags distributed:* ${report.bags}`,
    `*Date:* ${report.date}`
  ];
  if (report.notes) lines.push(`*Notes:* ${report.notes}`);
  lines.push(`_Reported at ${new Date().toLocaleString()}_`);

  const message = lines.join('\n');
  if (numberId && whatsappReady) {
    try {
      await client.sendMessage(numberId, message);
    } catch (err) {
      console.error('send distribution report to WhatsApp failed', err && err.message);
    }
  }

  return res.json({ ok: true, report, totals: aggregateDistributionByArea(distributionReports) });
});

app.post('/submit', rateLimit(60000, 10), async (req, res) => {
  const data = req.body || {};

  const numberId = formatPhone(TARGET_NUMBER);
  if (!numberId) {
    return res.status(400).json({ ok: false, error: 'WHATSAPP_NUMBER not configured' });
  }
  if (!whatsappReady) {
    return res.status(503).json({ ok: false, error: 'WhatsApp is not ready. Authenticate the service and try again.' });
  }

  // Build a human-friendly message
  const lines = [];
  lines.push('*New Campaign Request*');
  if (data.package) lines.push(`*Package:* ${cleanText(data.package, 80)}`);
  if (data.areas) lines.push(`*Areas:* ${cleanText(data.areas, 500)}`);
  if (data.fullName) lines.push(`*Name:* ${cleanText(data.fullName, 120)}`);
  if (data.email) lines.push(`*Email:* ${cleanText(data.email, 160)}`);
  if (data.phone) lines.push(`*Phone:* ${cleanText(data.phone, 40)}`);
  if (data.companyName) lines.push(`*Company:* ${cleanText(data.companyName, 160)}`);
  if (data.companyWebsite) lines.push(`*Website:* ${cleanText(data.companyWebsite, 300)}`);
  if (data.notes) lines.push(`*Notes:* ${cleanText(data.notes, 2000)}`);
  lines.push(`_Received at ${new Date().toLocaleString()}_
`);

  const message = lines.join('\n');

  try {
    const msg = await client.sendMessage(numberId, message);
    const id = msg && msg.id ? msg.id._serialized : null;
    console.log('Campaign request sent to WhatsApp', id || '(message id unavailable)');
    return res.json({ ok: true, id });
  } catch (err) {
    console.error('sendMessage error', err && err.message);
    return res.status(500).json({ ok: false, error: err && err.message });
  }
});

app.get('/', (req, res) => res.send('AdLite WhatsApp microservice running'));

app.get('/health', (req, res) => res.json({ ok: true, whatsappReady, distributionReports: distributionReports.length }));

app.listen(PORT, () => console.log(`Microservice listening on http://localhost:${PORT}`));
