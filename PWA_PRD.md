# Product Requirements Document (PRD)

## 1. Überblick

Eine Progressive Web App (PWA) soll es maximal fünf internen Windows‑Endanwendern ermöglichen, per Klick ein definiertes Skript (Batch / PowerShell) auf ihrem jeweiligen PC auszuführen. Die PWA wird öffentlich über **GitHub Pages** ausgeliefert; die Skriptausführung erfolgt ausschließlich lokal durch einen schlanken **Agent‑Dienst** auf 127.0.0.1.

## 2. Ziele und Erfolgskriterien

| Ziel                          | Messbare Erfolgskennzahl        | Sollwert    |
| ----------------------------- | ------------------------------- | ----------- |
| Reibungslose Skriptausführung | Ausführungen ohne Fehlermeldung | ≥ 99 %      |
| Einfache Erstinstallation     | Einrichtungsdauer pro PC        | ≤ 10 Min.   |
| Geringe Betriebskosten        | Hosting‑Kosten                  | 0 € / Monat |
| Sicherer Betrieb              | Unautorisierte Ausführungen     | 0           |

## 3. Stakeholder

| Rolle              | Verantwortlichkeit                        |
| ------------------ | ----------------------------------------- |
| **Product Owner**  | Anforderungsmanagement, Priorisierung     |
| **Entwicklerteam** | Umsetzung Frontend + Agent, CI/CD         |
| **IT‑Security**    | Prüfung Authentifizierung, Token‑Handling |
| **Endbenutzer**    | Ausführung des Skripts, Feedback          |

## 4. Scope

### In Scope

* Ausführung **eines** definierten Skripts („Run“).
* Rückgabe von Exitcode, stdout und stderr an die PWA.
* Offline‑Cache und Installierbarkeit der PWA.
* Token‑basierte Authentifizierung PWA ↔ Agent.
* Automatische Updates der PWA (Service Worker) und manuelle Update‑Prüfung des Agenten.

### Out of Scope

* Ausführung mehrerer unterschiedlicher Skripte.
* Zentrale Auswertung der Logs.
* Mobile Betriebssysteme.

## 5. Personas & User‑Journey

**Persona „Martin“ – interner Sachbearbeiter**

1. Öffnet URL `https://tool.firma.de` im Browser.
2. Installiert die PWA via Browser‑Prompt.
3. Startet Setup‐Installer `agent-setup.exe` → Dienst installiert.
4. Klickt in der PWA auf **„Skript ausführen“**.
5. Sieht Erfolgsmeldung + Logauszug.

## 6. User Stories & Akzeptanzkriterien

| ID    | User Story                                                                                                                       | Akzeptanzkriterien                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| US‑01 | *Als* Endbenutzer *möchte ich* das Skript per Button ausführen, *damit* ich komplexe Befehle nicht manuell eingeben muss.        | 1 Klick → Skript startet; Erfolg/Fehler wird innerhalb ≤ 2 s angezeigt. |
| US‑02 | *Als* Endbenutzer *möchte ich* eine klare Fehlermeldung, falls der Agent nicht läuft, *damit* ich weiß, woran es liegt.          | Agent offline ⇒ Modaler Dialog mit Setup‑Anleitung.                     |
| US‑03 | *Als* Sicherheitsbeauftragter *möchte ich*, dass nur autorisierte PWAs Befehle senden können, *damit* kein Fremdzugriff erfolgt. | Nur Requests mit gültigem Token werden akzeptiert (HTTP 401 sonst).     |

## 7. Funktionale Anforderungen

| Nr.  | Beschreibung                                                        |
| ---- | ------------------------------------------------------------------- |
| F‑01 | **REST‑Endpoint** `POST /run` auf Agent löst Skript aus.            |
| F‑02 | Endpoint validiert Header `X‑Agent‑Token`.                          |
| F‑03 | Rückgabe‐JSON enthält `exitCode`, `stdout`, `stderr`, `durationMs`. |
| F‑04 | PWA zeigt Toast bei Erfolg, Alert bei Fehler.                       |
| F‑05 | **Health‑Check** `GET /version` liefert Agent‑Version.              |
| F‑06 | PWA ruft bei Start `GET /token` ab, um Token lokal zu speichern.    |

## 8. Nicht‑funktionale Anforderungen

| Kategorie     | Anforderung                                                   |
| ------------- | ------------------------------------------------------------- |
| Performance   | Skriptstart ≤ 1 s nach Button‑Klick.                          |
| Verfügbarkeit | Agent‑Dienst startet automatisch beim Systemstart.            |
| Sicherheit    | Agent lauscht nur auf `127.0.0.1`; Token ≥ 32 Random‑Bytes.   |
| Wartbarkeit   | Codequalität nach ESLint/Prettier‑Regeln, 80 % Test‑Coverage. |
| Portabilität  | Agent lauffähig auf Windows 10/11 (64‑Bit).                   |

## 9. Architektur

```
Browser (PWA, HTTPS) ───▶ 127.0.0.1:3210 (HTTP) ───▶ Skript.ps1/BAT
```

* **Frontend:** React + Vite, Service Worker (Workbox), GitHub Pages Deployment.
* **Agent:** Node 18 + Express, child\_process.execFile.
* **Authentifizierung:** Static Token im Header.
* **CORS:** `Access‑Control‑Allow‑Origin: https://tool.firma.de`.

## 10. Technologiestack

* **Frontend:** TypeScript, React 18, Vite, Workbox, Jest + Playwright.
* **Agent:** Node.js 18, Express 4, winston Logger, node‑windows (Dienst).
* **CI/CD:** GitHub Actions (Build & Deploy).
* **Installer:** NSIS 3.x; Alternativ WiX Toolset.

## 11. Deployment & Releaseflow

1. **Commit → main** löst GitHub Actions Build aus: `npm run build` → Artefakt → Deploy to GitHub Pages (branch `gh-pages`).
2. Agent‑Branch Build: `pkg agent` → Upload `agent.exe` + NSIS Installer als Release.
3. Release‐Notes + SemVer Versionierung.

## 12. Sicherheit & Compliance

* Token wird bei Erstinstallation zufällig erzeugt (256 Bit) und in `%ProgramData%\Tool\token.txt` gespeichert.
* PowerShell‑Skript ist digital signiert; Agent ruft `powershell.exe -ExecutionPolicy Bypass -File ...` auf.
* Keine Speicherung personenbezogener Daten.

## 13. Monitoring & Logging

* Agent schreibt Rotations‑Log in `%ProgramData%\Tool\logs` (max 10 MB pro File, 30 Tage Aufbewahrung).
* PWA sendet optional Performance‑Metriken an eine Google Analytics Property (Opt‑In).

## 14. Risikobetrachtung

| Risiko                          | Auswirkung                      | Gegenmaßnahme                                                                        |
| ------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| Browser blockiert Loopback‑HTTP | Skriptausführung nicht möglich  | Vorab‑Tests mit Chrome / Edge / Firefox; optional lokalen HTTPS‑Agent konfigurieren. |
| Token kompromittiert            | Unautorisierte Skriptausführung | Möglichkeit Token per Installer neu zu setzen; Token‑Länge ≥ 32 Byte.                |
| Benutzer deinstalliert Agent    | PWA ohne Funktion               | PWA erkennt Offline‑Agent und zeigt Install‑Hinweis.                                 |

## 15. Zeitplan (T‑Basis: Projektstart)

| Meilenstein              | Dauer    | Kalenderwoche |
| ------------------------ | -------- | ------------- |
| Anforderungsabnahme      | 1 Woche  | KW 25/2025    |
| Prototyp Agent + PWA     | 2 Wochen | KW 26–27      |
| Interner Test (5 User)   | 1 Woche  | KW 28         |
| Review & Härtung         | 1 Woche  | KW 29         |
| Roll‑out & Dokumentation | 1 Woche  | KW 30         |

---

*Zuletzt aktualisiert: 17. Juni 2025*
