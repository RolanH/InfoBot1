# GitHub Pages Setup für PWA Script Runner

## Übersicht
GitHub Pages wird als kostenloses Hosting für die PWA verwendet. Die Konfiguration ermöglicht automatische Deployments und sichere HTTPS-Bereitstellung.

## 1. Repository Konfiguration

### 1.1 Repository Structure
```
InfoBot/
├── .github/
│   └── workflows/
│       ├── deploy-pwa.yml      # PWA Deployment
│       └── release-agent.yml   # Agent Release
├── pwa/                        # PWA Source Code
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── agent/                      # Agent Source Code
│   ├── src/
│   ├── installer/
│   └── package.json
├── docs/                       # GitHub Pages Content
└── README.md
```

### 1.2 GitHub Pages Einstellungen
1. **Repository Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` (wird automatisch erstellt)
4. **Folder:** `/root`
5. **Custom Domain:** `tool.firma.de` (optional)

## 2. Automatisches Deployment Setup

### 2.1 GitHub Actions Workflow
```yaml
# .github/workflows/deploy-pwa.yml
name: Deploy PWA to GitHub Pages

on:
  push:
    branches: [main]
    paths: ['pwa/**']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'pwa/package-lock.json'
          
      - name: Install dependencies
        working-directory: ./pwa
        run: npm ci
        
      - name: Build PWA
        working-directory: ./pwa
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './pwa/dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2.2 Vite Konfiguration für GitHub Pages
```typescript
// pwa/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Script Runner Tool',
        short_name: 'ScriptRunner',
        description: 'Lokale Skriptausführung via Agent',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/InfoBot/',
        start_url: '/InfoBot/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Jahr
              }
            }
          }
        ]
      }
    })
  ],
  base: '/InfoBot/', // GitHub Repository Name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
})
```

## 3. PWA Manifest Konfiguration

### 3.1 Web App Manifest
```json
// pwa/public/manifest.json
{
  "name": "Script Runner Tool",
  "short_name": "ScriptRunner",
  "description": "Lokale Skriptausführung via Agent-Service",
  "start_url": "/InfoBot/",
  "scope": "/InfoBot/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "pwa-64x64.png",
      "sizes": "64x64",
      "type": "image/png"
    },
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["utilities", "productivity"],
  "lang": "de-DE",
  "dir": "ltr"
}
```

### 3.2 HTML Meta Tags
```html
<!-- pwa/index.html -->
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#1976d2" />
  <meta name="description" content="Lokale Skriptausführung via Agent-Service" />
  
  <!-- Apple Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="ScriptRunner" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  
  <!-- Microsoft Meta Tags -->
  <meta name="msapplication-TileColor" content="#1976d2" />
  <meta name="msapplication-config" content="/browserconfig.xml" />
  
  <title>Script Runner Tool</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## 4. CORS & Security Konfiguration

### 4.1 Agent CORS Setup
```typescript
// agent/src/server.ts
import express from 'express';
import cors from 'cors';

const app = express();

// CORS Konfiguration für GitHub Pages
const corsOptions = {
  origin: [
    'https://r-hagi.github.io', // GitHub Pages Standard URL
    'https://tool.firma.de',    // Custom Domain (falls verwendet)
    'http://localhost:5173',    // Entwicklung
    'http://127.0.0.1:5173'     // Entwicklung
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Agent-Token'],
  credentials: false
};

app.use(cors(corsOptions));
```

### 4.2 Content Security Policy
```typescript
// pwa/src/main.tsx
// CSP Header via Meta Tag in index.html
const cspContent = `
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' http://127.0.0.1:3210 http://localhost:3210;
  img-src 'self' data: https:;
  manifest-src 'self';
`.replace(/\s+/g, ' ').trim();
```

## 5. Custom Domain Setup (Optional)

### 5.1 DNS Konfiguration
```dns
# DNS Records für tool.firma.de
CNAME  tool.firma.de  r-hagi.github.io
```

### 5.2 GitHub Pages Custom Domain
```
# File: pwa/public/CNAME
tool.firma.de
```

### 5.3 HTTPS Enforcement
- GitHub Pages erzwingt automatisch HTTPS für Custom Domains
- Zertifikat wird automatisch via Let's Encrypt bereitgestellt

## 6. Development Workflow

### 6.1 Lokale Entwicklung
```bash
# PWA lokal starten
cd pwa
npm install
npm run dev
# → http://localhost:5173

# Agent parallel starten
cd agent
npm install
npm run dev
# → http://127.0.0.1:3210
```

### 6.2 Build & Test
```bash
# PWA Build testen
cd pwa
npm run build
npm run preview

# Agent Build testen
cd agent
npm run build
npm run test
```

### 6.3 Deployment Trigger
```bash
# Automatisches Deployment via Git Push
git add .
git commit -m "feat: update PWA"
git push origin main
# → Triggert GitHub Actions Deployment
```

## 7. Monitoring & Analytics

### 7.1 GitHub Pages Analytics
```typescript
// pwa/src/utils/analytics.ts
export const trackEvent = (eventName: string, properties?: object) => {
  if (import.meta.env.PROD) {
    // Google Analytics 4 (optional)
    gtag('event', eventName, properties);
  }
};

// Usage
trackEvent('script_executed', { 
  exitCode: result.exitCode,
  duration: result.durationMs 
});
```

### 7.2 Performance Monitoring
```typescript
// pwa/src/utils/performance.ts
export const measurePerformance = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    
    console.log(`PWA Load Time: ${loadTime}ms`);
    
    // Optional: Send to Analytics
    trackEvent('performance_metric', {
      loadTime,
      connectionType: navigator.connection?.effectiveType
    });
  }
};
```

## 8. Troubleshooting

### 8.1 Häufige Probleme

**Problem:** PWA lädt nicht nach Deployment
```bash
# Lösung: Cache leeren
- Ctrl+F5 (Hard Refresh)
- Developer Tools → Application → Storage → Clear Storage
```

**Problem:** CORS Fehler beim Agent-Zugriff
```typescript
// Lösung: Agent CORS Origin prüfen
const allowedOrigins = [
  'https://r-hagi.github.io',
  'https://tool.firma.de'
];
```

**Problem:** Service Worker Update funktioniert nicht
```typescript
// Lösung: Force Update implementieren
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.update());
  });
}
```

### 8.2 Debug Tools
```bash
# GitHub Actions Logs prüfen
https://github.com/R-Hagi/InfoBot/actions

# Lighthouse PWA Audit
npx lighthouse https://r-hagi.github.io/InfoBot/ --view

# Service Worker Debug
Chrome DevTools → Application → Service Workers
```

## 9. Sicherheit Best Practices

### 9.1 Token Security
```typescript
// PWA Token Storage (nicht in localStorage!)
const tokenStore = {
  get: () => sessionStorage.getItem('agent-token'),
  set: (token: string) => sessionStorage.setItem('agent-token', token),
  clear: () => sessionStorage.removeItem('agent-token')
};
```

### 9.2 Input Sanitization
```typescript
// Agent Request Validation
const validateToken = (token: string): boolean => {
  return /^[A-Za-z0-9+/]{43}=$/.test(token); // Base64 256-bit
};
```

## 10. URLs & Zugangsdaten

### 10.1 Production URLs
```
PWA: https://r-hagi.github.io/InfoBot/
Agent: http://127.0.0.1:3210
Repository: https://github.com/R-Hagi/InfoBot
```

### 10.2 Development URLs
```
PWA Dev: http://localhost:5173
Agent Dev: http://127.0.0.1:3210
```

---

**Nächste Schritte für GitHub Pages Setup:**
1. Repository Struktur anlegen
2. GitHub Actions Workflow konfigurieren
3. Vite Build für GitHub Pages anpassen
4. PWA Manifest erstellen
5. Erste Deployment testen 