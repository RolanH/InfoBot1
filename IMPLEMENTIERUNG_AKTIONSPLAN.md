# Aktionsplan: PWA Script-Ausführung mit Agent-Service

## Übersicht
Implementierung einer Progressive Web App (PWA) mit lokalem Agent-Service zur sicheren Ausführung von Skripten auf Windows-PCs für maximal 5 interne Benutzer.

## Phase 1: Projektvorbereitung & Setup (KW 25/2025)

### 1.1 Repository & CI/CD Setup
- [ ] GitHub Repository erstellen
- [ ] Branch-Strategie definieren (`main`, `develop`, `gh-pages`)
- [ ] GitHub Actions Workflows konfigurieren:
  - PWA Build & Deploy zu GitHub Pages
  - Agent Build & Release mit NSIS Installer
- [ ] Entwicklungsumgebung dokumentieren

### 1.2 Technologie-Stack Vorbereitung
- [ ] Node.js 18 Entwicklungsumgebung
- [ ] Frontend-Tools: React 18, TypeScript, Vite
- [ ] Agent-Tools: Express 4, winston, node-windows
- [ ] Build-Tools: pkg, NSIS 3.x
- [ ] Test-Tools: Jest, Playwright

## Phase 2: Agent-Service Entwicklung (KW 26-27/2025)

### 2.1 Core Agent Implementation
```typescript
// Dateistruktur Agent
agent/
├── src/
│   ├── server.ts          // Express Server
│   ├── tokenManager.ts    // Token-Verwaltung
│   ├── scriptRunner.ts    // Skript-Ausführung
│   ├── logger.ts          // Winston Logger
│   └── config.ts          // Konfiguration
├── scripts/
│   └── example.ps1        // Beispiel PowerShell Skript
├── installer/
│   ├── installer.nsi      // NSIS Installer Script
│   └── service-install.js // Windows Service Setup
└── package.json
```

**Implementierungsschritte:**

- [ ] **Express Server Setup**
  ```typescript
  // Endpoints implementieren:
  // POST /run - Skript ausführen
  // GET /version - Agent Version
  // GET /token - Token abrufen
  // GET /health - Health Check
  ```

- [ ] **Token-Management System**
  ```typescript
  // Token-Generierung (256-bit)
  // Speicherung in %ProgramData%\Tool\token.txt
  // Validierung bei jedem Request
  ```

- [ ] **Skript-Ausführung Engine**
  ```typescript
  // child_process.execFile für sichere Ausführung
  // Timeout-Handling (max 30s)
  // stdout/stderr Capturing
  // Exit-Code Handling
  ```

- [ ] **Security Implementation**
  ```typescript
  // CORS nur für definierte Origin
  // Localhost-Only Binding (127.0.0.1:3210)
  // Header-Validation (X-Agent-Token)
  ```

### 2.2 Windows Service Integration
- [ ] **node-windows Service Wrapper**
  ```javascript
  // Automatischer Start beim Systemboot
  // Service Logging
  // Graceful Shutdown Handling
  ```

- [ ] **Installer Development (NSIS)**
  ```nsis
  // Service Installation
  // Token-Generierung bei Erstinstallation
  // Firewall-Regeln (falls nötig)
  // Deinstallations-Routine
  ```

### 2.3 Logging & Monitoring
- [ ] **Winston Logger Konfiguration**
  ```typescript
  // Datei-Rotation (max 10MB, 30 Tage)
  // Log-Level: info, warn, error
  // Speicherort: %ProgramData%\Tool\logs\
  ```

## Phase 3: PWA Frontend Entwicklung (KW 26-27/2025)

### 3.1 React App Setup mit Vite
```typescript
// Dateistruktur PWA
pwa/
├── src/
│   ├── components/
│   │   ├── ScriptRunner.tsx    // Haupt-Komponente
│   │   ├── StatusIndicator.tsx // Agent Status
│   │   ├── LogViewer.tsx       // Ausgabe Anzeige
│   │   └── ErrorModal.tsx      // Fehler Dialog
│   ├── services/
│   │   ├── agentApi.ts         // Agent API Client
│   │   └── tokenStorage.ts     // Token Management
│   ├── hooks/
│   │   ├── useAgentStatus.ts   // Agent Health Check
│   │   └── useScriptRunner.ts  // Skript Ausführung
│   ├── types/
│   │   └── agent.types.ts      // TypeScript Interfaces
│   └── App.tsx
├── public/
│   ├── manifest.json           // PWA Manifest
│   ├── sw.js                   // Service Worker
│   └── icons/                  // PWA Icons
└── vite.config.ts
```

### 3.2 Core Components Implementation

- [ ] **ScriptRunner Component**
  ```typescript
  interface ScriptRunnerProps {
    onSuccess: (result: ScriptResult) => void;
    onError: (error: Error) => void;
  }
  
  // Features:
  // - Ein-Klick Skript-Ausführung
  // - Loading State während Ausführung
  // - Erfolgs-/Fehler-Feedback
  ```

- [ ] **Agent API Client**
  ```typescript
  class AgentApiClient {
    async runScript(): Promise<ScriptResult>
    async getVersion(): Promise<string>
    async getToken(): Promise<string>
    async healthCheck(): Promise<boolean>
  }
  ```

- [ ] **Error Handling System**
  ```typescript
  // Agent offline Detection
  // Setup-Anleitung Modal
  // Toast Notifications
  // Retry Logic
  ```

### 3.3 PWA Features Implementation
- [ ] **Service Worker (Workbox)**
  ```javascript
  // Offline-First Caching Strategy
  // App Shell Caching
  // Update Notifications
  ```

- [ ] **Web App Manifest**
  ```json
  {
    "name": "Script Runner Tool",
    "short_name": "ScriptRunner",
    "display": "standalone",
    "theme_color": "#1976d2"
  }
  ```

- [ ] **Installability Features**
  ```typescript
  // Install Prompt Handling
  // Standalone Detection
  // Update Available Notifications
  ```

## Phase 4: Integration & Testing (KW 28/2025)

### 4.1 End-to-End Integration
- [ ] **Lokale Entwicklungsumgebung**
  ```bash
  # Agent lokal starten
  cd agent && npm run dev
  
  # PWA entwicklung
  cd pwa && npm run dev
  
  # Cross-Origin Testing
  ```

- [ ] **Token-Flow Testing**
  ```typescript
  // Token-Generierung bei Agent-Start
  // Token-Abruf durch PWA
  // Token-Validation bei Requests
  ```

### 4.2 Test Implementation
- [ ] **Agent Unit Tests (Jest)**
  ```typescript
  // Token-Management Tests
  // Script-Execution Tests
  // API Endpoint Tests
  // Error Handling Tests
  ```

- [ ] **PWA Component Tests**
  ```typescript
  // React Component Tests
  // API Client Tests
  // Hook Tests
  // Error Boundary Tests
  ```

- [ ] **E2E Tests (Playwright)**
  ```typescript
  // Vollständiger User Flow
  // Agent Offline Scenarios
  // Error Recovery Tests
  ```

### 4.3 Security Testing
- [ ] **Penetration Testing**
  ```typescript
  // CORS Validation
  // Token Brute-Force Protection
  // Input Validation
  // Script Injection Prevention
  ```

## Phase 5: Build & Deployment Setup (KW 28/2025)

### 5.1 GitHub Actions Workflows

- [ ] **PWA Deployment Workflow**
  ```yaml
  # .github/workflows/deploy-pwa.yml
  name: Deploy PWA
  on:
    push:
      branches: [main]
  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
        - run: npm ci && npm run build
        - uses: peaceiris/actions-gh-pages@v3
  ```

- [ ] **Agent Release Workflow**
  ```yaml
  # .github/workflows/release-agent.yml
  name: Build Agent Release
  on:
    push:
      tags: ['v*']
  jobs:
    build:
      runs-on: windows-latest
      steps:
        - uses: actions/checkout@v3
        - run: npm ci && npm run build:exe
        - run: makensis installer/installer.nsi
        - uses: softprops/action-gh-releases@v1
  ```

### 5.2 Release Packaging
- [ ] **Agent Executable Build**
  ```json
  // package.json script
  "build:exe": "pkg . --targets node18-win-x64 --output dist/agent.exe"
  ```

- [ ] **NSIS Installer Configuration**
  ```nsis
  # Installer Features:
  # - Service Installation
  # - Token-Generierung
  # - Uninstaller
  # - Version Detection
  ```

## Phase 6: User Testing & Feedback (KW 28/2025)

### 6.1 Interne Testphase
- [ ] **5 Test-Benutzer Setup**
  ```bash
  # Pro Benutzer:
  # 1. Installer herunterladen und ausführen
  # 2. PWA unter https://tool.firma.de öffnen
  # 3. PWA installieren
  # 4. Skript-Ausführung testen
  ```

- [ ] **Feedback Collection**
  ```typescript
  // User Experience Feedback
  // Performance Metriken
  // Error Reports
  // Feature Requests
  ```

### 6.2 Bug Fixes & Optimierungen
- [ ] Performance Optimierungen
- [ ] UX Verbesserungen
- [ ] Stability Fixes
- [ ] Documentation Updates

## Phase 7: Production Deployment (KW 29-30/2025)

### 7.1 Production Readiness
- [ ] **Final Security Review**
- [ ] **Performance Testing**
- [ ] **Documentation Completion**
  ```markdown
  # Dokumentation erstellen:
  # - User Manual
  # - Installation Guide
  # - Troubleshooting Guide
  # - Developer Documentation
  ```

### 7.2 Rollout Strategy
- [ ] **Staged Rollout**
  ```
  Phase 1: 2 Power Users (1 Tag)
  Phase 2: Alle 5 Benutzer (3 Tage)
  Phase 3: Monitoring & Support (laufend)
  ```

- [ ] **Support & Monitoring Setup**
  ```typescript
  // Error Tracking Setup
  // Performance Monitoring
  // User Support Prozess
  ```

## Technische Spezifikationen

### API Contracts

#### Agent Endpoints
```typescript
// POST /run
interface RunRequest {
  headers: { 'X-Agent-Token': string }
}

interface RunResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

// GET /version
interface VersionResponse {
  version: string;
  buildDate: string;
}

// GET /token
interface TokenResponse {
  token: string;
}
```

### Security Specifications
```typescript
// Token Requirements
const TOKEN_LENGTH = 32; // bytes
const TOKEN_ENCODING = 'base64';

// CORS Configuration
const ALLOWED_ORIGINS = ['https://tool.firma.de'];

// Server Configuration
const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 3210;
```

### Build Configuration

#### Vite Configuration (PWA)
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  base: '/InfoBot/',
  build: {
    outDir: 'dist'
  }
});
```

#### Package Configuration (Agent)
```json
{
  "pkg": {
    "targets": ["node18-win-x64"],
    "outputPath": "dist",
    "assets": ["scripts/**/*"]
  }
}
```

## Qualitätssicherung

### Code Quality Standards
- [ ] ESLint + Prettier Konfiguration
- [ ] TypeScript Strict Mode
- [ ] 80% Test Coverage Ziel
- [ ] Code Review Process

### Performance Targets
- [ ] Skript-Start ≤ 1s nach Button-Klick
- [ ] PWA Load Time ≤ 2s
- [ ] Agent Memory Usage ≤ 50MB
- [ ] Battery Impact: Minimal

## Risiko-Mitigation

### Technische Risiken
| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|---------|------------|
| Browser blockiert Loopback-HTTP | Mittel | Hoch | Vorab-Tests mit allen Browsern, HTTPS-Option |
| Token Kompromittierung | Niedrig | Mittel | Token-Rotation, starke Generierung |
| Service Crashes | Niedrig | Mittel | Graceful Error Handling, Auto-Restart |

### Zeitplan-Risiken
- **Puffer einbauen:** +1 Woche für unvorhergesehene Probleme
- **Parallele Entwicklung:** Agent und PWA parallel entwickeln
- **Frühe Integration:** Tägliche Integration Tests

## Success Metrics

### Technische KPIs
- ✅ 99% erfolgreiche Skript-Ausführungen
- ✅ ≤10 Minuten Setup-Zeit pro PC
- ✅ 0€ Hosting-Kosten (GitHub Pages)
- ✅ 0 unautorisierte Zugriffe

### User Experience KPIs
- ✅ User Satisfaction Score ≥ 4/5
- ✅ Support Tickets ≤ 1 pro Monat
- ✅ Training Zeit ≤ 5 Minuten

---

**Nächste Schritte:**
1. Repository Setup und Branch-Strategie
2. Entwicklungsumgebung aufsetzen
3. Agent Core Implementation beginnen
4. PWA Grundgerüst erstellen
5. CI/CD Pipeline konfigurieren 