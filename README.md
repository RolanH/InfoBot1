# InfoBot - Progressive Web App für Skript-Ausführung

InfoBot ist eine Progressive Web App (PWA), die es ermöglicht, vordefinierte Skripte sicher auf lokalen Windows-PCs auszuführen. Die Lösung besteht aus einer PWA (Frontend) und einem lokalen Agent-Service (Backend).

## 🏗️ Architektur

```
Browser (PWA, HTTPS) ───▶ 127.0.0.1:3210 (HTTP) ───▶ PowerShell/Batch Script
```

- **PWA**: React-basierte Progressive Web App, gehostet auf GitHub Pages
- **Agent**: Node.js-basierter Windows Service für lokale Skript-Ausführung
- **Sicherheit**: Token-basierte Authentifizierung, CORS-Schutz, Localhost-Only

## 🚀 Features

- ✅ **Ein-Klick Skript-Ausführung** über moderne Web-Oberfläche
- ✅ **Progressive Web App** - Installierbar und offline-fähig
- ✅ **Sichere Authentifizierung** mit 256-bit Token
- ✅ **Windows Service Integration** - Automatischer Start beim Systemboot
- ✅ **Echtzeit Status-Überwachung** des Agent-Service
- ✅ **Deutsche Benutzeroberfläche** mit benutzerfreundlichen Fehlermeldungen
- ✅ **Zero Hosting-Kosten** durch GitHub Pages Deployment

## 📦 Installation

### 1. Agent Installation (Pro PC)

1. Laden Sie den neuesten [InfoBot Agent Installer](https://github.com/r-hagi/InfoBot/releases) herunter
2. Führen Sie `InfoBot-Setup.exe` als Administrator aus
3. Der Agent wird automatisch als Windows Service installiert und gestartet
4. Überprüfen Sie die Installation: Agent läuft auf `127.0.0.1:3210`

### 2. PWA Zugriff

1. Öffnen Sie https://r-hagi.github.io/InfoBot/ in einem modernen Browser
2. Installieren Sie die PWA über das Browser-Menü (optional)
3. Die PWA verbindet sich automatisch mit dem lokalen Agent

## 🛠️ Entwicklung

### Voraussetzungen

- Node.js 18+
- Windows 10/11 (für Agent-Service)
- Git

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/r-hagi/InfoBot.git
cd InfoBot

# Dependencies installieren
npm install

# Agent entwickeln
npm run dev:agent

# PWA entwickeln (in separatem Terminal)
npm run dev:pwa
```

### Build & Deployment

```bash
# PWA für Production builden
npm run build:pwa

# Agent Executable erstellen
npm run build:agent
```

## 🔧 Konfiguration

### Agent Konfiguration

Der Agent kann über Umgebungsvariablen konfiguriert werden:

```bash
# Entwicklungsmodus
NODE_ENV=development

# Custom Port (Standard: 3210)
AGENT_PORT=3210

# Custom Script Pfad
SCRIPT_PATH=C:\path\to\your\script.ps1
```

### PWA Konfiguration

Die PWA-Konfiguration erfolgt in `pwa/vite.config.ts`:

```typescript
// GitHub Pages Base URL
base: '/InfoBot/',

// Allowed Origins für CORS
allowedOrigins: ['https://r-hagi.github.io']
```

## 📁 Projektstruktur

```
InfoBot/
├── agent/                    # Agent Service (Node.js)
│   ├── src/
│   │   ├── server.ts        # Express Server
│   │   ├── tokenManager.ts  # Token-Verwaltung
│   │   ├── scriptRunner.ts  # Skript-Ausführung
│   │   └── logger.ts        # Winston Logger
│   ├── scripts/
│   │   └── example.ps1      # Beispiel PowerShell Script
│   └── installer/
│       └── installer.nsi    # NSIS Installer Script
├── pwa/                     # Progressive Web App (React)
│   ├── src/
│   │   ├── components/      # React Komponenten
│   │   ├── services/        # API Client
│   │   ├── hooks/          # Custom React Hooks
│   │   └── types/          # TypeScript Definitionen
│   └── public/             # Statische Assets
└── .github/workflows/       # CI/CD Pipelines
```

## 🔒 Sicherheit

- **Token-Authentifizierung**: 256-bit Zufallstoken pro Installation
- **CORS-Schutz**: Nur definierte Origins erlaubt
- **Localhost-Only**: Agent bindet nur an 127.0.0.1
- **Input-Validation**: Alle Eingaben werden validiert
- **Secure Headers**: Sicherheits-Header in HTTP-Responses

## 🧪 Testing

```bash
# Unit Tests ausführen
npm test

# E2E Tests (Playwright)
npm run test:e2e

# Linting
npm run lint

# Code Formatierung
npm run format
```

## 📊 Monitoring & Logs

### Agent Logs

```bash
# Log-Pfad (Windows)
%ProgramData%\InfoBot\logs\

# Logs anzeigen
Get-Content "$env:ProgramData\InfoBot\logs\agent.log" -Tail 50
```

### PWA Monitoring

- Service Worker Status in Browser DevTools
- Network Tab für API-Aufrufe
- Console für JavaScript Fehler

## 🚨 Troubleshooting

### Agent startet nicht

1. Überprüfen Sie Windows Services: `services.msc`
2. Prüfen Sie die Logs: `%ProgramData%\InfoBot\logs\error.log`
3. Neuinstallation als Administrator

### PWA kann nicht auf Agent zugreifen

1. Überprüfen Sie, ob Agent läuft: `http://127.0.0.1:3210/health`
2. Browser-CORS-Einstellungen prüfen
3. Firewall/Antivirus-Software prüfen

### Skript-Ausführung schlägt fehl

1. PowerShell Execution Policy prüfen
2. Skript-Berechtigungen überprüfen
3. Agent-Logs auf Fehlerdetails prüfen

## 🤝 Contributing

1. Fork des Repositories erstellen
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request öffnen

## 📝 Lizenz

Dieses Projekt steht unter der MIT Lizenz - siehe [LICENSE](LICENSE) für Details.

## 🔗 Links

- [GitHub Repository](https://github.com/r-hagi/InfoBot)
- [PWA Live Demo](https://r-hagi.github.io/InfoBot/)
- [Releases & Downloads](https://github.com/r-hagi/InfoBot/releases)
- [Issues & Support](https://github.com/r-hagi/InfoBot/issues) 