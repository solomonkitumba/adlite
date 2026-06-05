AdLite WhatsApp microservice
=================================

This lightweight Node.js microservice forwards form submissions to a WhatsApp number using `whatsapp-web.js` (which automates WhatsApp Web). It is free to run but requires you to authenticate once by scanning the displayed QR code from a phone running WhatsApp.

Setup
------

1. Install dependencies:

```bash
cd server
npm install
```

2. Set environment variable `WHATSAPP_NUMBER` to the recipient phone (digits only, e.g. `256778597244`). Optionally set `PORT`.

3. Start the service and scan the QR that appears in the terminal using WhatsApp on your phone:

```bash
npm start
# or for dev
npm run dev
```

The first run will show a QR in the terminal. Scan it with the phone that will send/receive messages. The session is persisted automatically in `.local-auth` and you won't need to scan again unless the session expires.

Usage
------

Send a POST request with JSON to `/submit`.

Example:

```bash
curl -X POST http://localhost:3001/submit \
  -H "Content-Type: application/json" \
  -d '{"package":"Starter","areas":"Nakasero, Makindye","fullName":"Solomon","email":"you@example.com","phone":"+256777...","companyName":"MyCo"}'
```

The microservice will format the data and forward it to the configured WhatsApp number.

Notes
------
- This uses WhatsApp Web automation; keep the process running and authenticated.
- Not an official WhatsApp Business API; it replicates user sessions and is suitable for small-scale automation.
- Ensure you comply with WhatsApp Terms of Service and local messaging laws.
