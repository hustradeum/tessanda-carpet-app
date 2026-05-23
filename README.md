# Tessanda Teppich Konfigurator — Shopify App

Shopify App + Theme App Extension für den Teppich-Konfigurator von [Tessanda Handweberei](https://tessanda.ch).

## Voraussetzungen

- Node.js >= 18
- `npm install -g @shopify/cli`
- [Shopify Partner Account](https://partners.shopify.com) (kostenlos)
- Ein Shopify Development Store

---

## Lokale Entwicklung

### 1. Umgebungsvariablen einrichten

```bash
cp .env.example .env
# .env bearbeiten: SMTP_PASS und SHOPIFY_API_KEY/SECRET eintragen
```

### 2. Extension bauen (watch mode)

```bash
# Terminal 1
npm run dev:extension
```

### 3. App starten

```bash
# Terminal 2
npm run dev
# → Browser öffnet sich für Shopify-Login
# → ngrok-Tunnel wird gestartet
# → App auf dem Development Store installiert
```

### 4. Konfigurator im Theme aktivieren

1. Shopify Admin → **Online Store → Themes → Customize**
2. Eine Seite wählen (z.B. neue leere Seite "Teppichkonfigurator")
3. Links: **Add block → Teppich Konfigurator**
4. Block-Einstellung **«App API URL»** = ngrok-URL aus Terminal 2
5. Speichern → im Browser testen

---

## Projektstruktur

```
tessanda-carpet-app/
├── app/
│   ├── lib/
│   │   ├── carpet-html.server.ts   # HTML-Template für PDF (portiert von create-carpet-pdf.php)
│   │   ├── pdf.server.ts           # PDF-Generierung via Puppeteer
│   │   └── email.server.ts         # Nodemailer SMTP (portiert von send-carpet-mail.php)
│   └── routes/
│       ├── app._index.tsx          # Admin-Panel
│       ├── api.send-quote.tsx      # POST: E-Mail + PDF versenden
│       └── api.generate-pdf.tsx    # POST: PDF als base64 zurückgeben
├── extensions/carpet-configurator/
│   ├── blocks/
│   │   └── carpet-configurator.liquid   # Shopify Theme Block
│   └── assets/                          # Kompiliertes JS/CSS (Vite-Output, nicht editieren)
├── src/                                 # React-Quellcode für die TAE
│   ├── main.tsx                         # Entry point
│   ├── App.tsx                          # Hauptkomponente
│   ├── App.css                          # Styles
│   └── components/
│       ├── TileTop.tsx / TileBottom.tsx # SVG-Kacheln (1:1 aus WordPress)
│       ├── CarpetPreview.tsx
│       ├── ColorPicker.tsx
│       ├── PatternPicker.tsx
│       ├── SizePicker.tsx
│       └── Form.tsx
├── vite.config.ts              # Remix App Build
└── vite.extension.config.ts    # TAE Bundle Build
```

---

## API-Endpunkte

### `POST /api/send-quote`

Generiert PDF und versendet E-Mails an Kunde + Admin.

**Body:**
```json
{
  "firstname": "Max",
  "lastname": "Muster",
  "mail": "max@example.com",
  "phone": "+41 79 123 45 67",
  "message": "optional",
  "width": 126,
  "height": 90,
  "pattern": "Halbraute",
  "colors": {
    "1-top": { "row": "1-top", "color1": "#BB635D", "color2": "#ffffff" }
  }
}
```

### `POST /api/generate-pdf`

Gibt PDF als base64 zurück (für "Als PDF herunterladen" Button).

**Body:** gleich wie oben, ohne Kontaktdaten.

---

## Deployment (nach lokalen Tests)

```bash
# Backend auf Fly.io deployen
flyctl launch --name tessanda-carpet-app
flyctl secrets set \
  SMTP_HOST=mail.cyon.ch \
  SMTP_PORT=465 \
  SMTP_USER=shop@tessanda.ch \
  SMTP_PASS=xxx \
  ADMIN_EMAIL=allegra@tessanda.ch
flyctl deploy

# Extension deployen
shopify app deploy
```

Dann in der Theme-Einstellung die API-URL von der ngrok-URL auf die Fly.io-URL aktualisieren.

---

## Sicherheit

- SMTP-Passwort **niemals** committen — nur in `.env` (lokal) und Fly.io Secrets
- `.env` ist in `.gitignore` eingetragen
