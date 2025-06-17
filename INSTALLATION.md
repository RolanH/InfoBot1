# InfoBot Installation Guide

Diese Anleitung führt Sie durch die komplette Installation von InfoBot auf einem Windows-PC.

## 📋 Voraussetzungen

- Windows 10 oder Windows 11
- Administrator-Rechte für die Installation
- Moderner Webbrowser (Chrome, Edge, Firefox)
- Internetverbindung für den Download

## 🚀 Schritt-für-Schritt Installation

### Schritt 1: Agent Installer herunterladen

1. Öffnen Sie die [InfoBot Releases Seite](https://github.com/r-hagi/InfoBot/releases)
2. Laden Sie die neueste Version von `InfoBot-Setup.exe` herunter
3. Speichern Sie die Datei in einem temporären Ordner (z.B. Downloads)

### Schritt 2: Agent installieren

1. **Rechtsklick** auf `InfoBot-Setup.exe` → **"Als Administrator ausführen"**
2. Bestätigen Sie die UAC-Eingabeaufforderung mit **"Ja"**
3. Folgen Sie dem Installationsassistenten:
   - Akzeptieren Sie die Lizenzvereinbarung
   - Wählen Sie den Installationsordner (Standard: `C:\Program Files\InfoBot Agent`)
   - Klicken Sie auf **"Installieren"**

4. Der Installer wird automatisch:
   - Den Agent als Windows Service installieren
   - Den Service starten
   - Ein Authentifizierungstoken generieren

5. Nach erfolgreicher Installation erscheint eine Bestätigungsmeldung

### Schritt 3: Installation überprüfen

1. Öffnen Sie **PowerShell** als Administrator
2. Überprüfen Sie den Service-Status:
   ```powershell
   Get-Service "InfoBot Agent"
   ```
   Status sollte **"Running"** sein

3. Testen Sie die Agent-Verbindung:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:3210/health"
   ```
   Sollte eine JSON-Antwort mit Status "ok" zurückgeben

### Schritt 4: PWA öffnen

1. Öffnen Sie Ihren Webbrowser
2. Navigieren Sie zu: **https://r-hagi.github.io/InfoBot/**
3. Die PWA sollte automatisch eine Verbindung zum lokalen Agent herstellen
4. Sie sollten einen grünen **"Agent Online"** Status sehen

### Schritt 5: PWA installieren (Optional)

1. Klicken Sie auf das **"App installieren"** Symbol in der Browser-Adressleiste
2. Oder über das Browser-Menü → **"InfoBot installieren"**
3. Die PWA wird als Desktop-App installiert

## ✅ Installation erfolgreich!

Sie können jetzt:
- ✅ Skripte mit einem Klick ausführen
- ✅ Den Agent-Status in Echtzeit überwachen  
- ✅ Die PWA als Desktop-App verwenden

## 🔧 Erweiterte Konfiguration

### Custom Script verwenden

1. Ersetzen Sie das Standard-Script:
   ```
   C:\Program Files\InfoBot Agent\example.ps1
   ```

2. Oder konfigurieren Sie einen anderen Pfad über die Registry:
   ```powershell
   Set-ItemProperty -Path "HKLM:\SOFTWARE\InfoBot" -Name "ScriptPath" -Value "C:\Path\To\Your\Script.ps1"
   ```

3. Starten Sie den Service neu:
   ```powershell
   Restart-Service "InfoBot Agent"
   ```

### Port ändern

1. Bearbeiten Sie die Konfiguration:
   ```powershell
   Set-ItemProperty -Path "HKLM:\SOFTWARE\InfoBot" -Name "Port" -Value "3211"
   ```

2. Service neu starten:
   ```powershell
   Restart-Service "InfoBot Agent"
   ```

## 🚨 Troubleshooting

### Problem: Service startet nicht

**Lösung:**
```powershell
# Service-Status prüfen
Get-Service "InfoBot Agent"

# Service manuell starten
Start-Service "InfoBot Agent"

# Logs prüfen
Get-Content "$env:ProgramData\InfoBot\logs\error.log" -Tail 20
```

### Problem: PWA zeigt "Agent Offline"

**Mögliche Ursachen & Lösungen:**

1. **Service läuft nicht:**
   ```powershell
   Start-Service "InfoBot Agent"
   ```

2. **Firewall blockiert Port 3210:**
   ```powershell
   New-NetFirewallRule -DisplayName "InfoBot Agent" -Direction Inbound -Port 3210 -Protocol TCP -Action Allow
   ```

3. **Antivirus blockiert Agent:**
   - Fügen Sie `C:\Program Files\InfoBot Agent\` zu den Ausnahmen hinzu

### Problem: Skript-Ausführung schlägt fehl

**PowerShell Execution Policy prüfen:**
```powershell
Get-ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Problem: Token-Fehler

**Token neu generieren:**
```powershell
Stop-Service "InfoBot Agent"
Remove-Item "$env:ProgramData\InfoBot\token.txt" -Force
Start-Service "InfoBot Agent"
```

## 🗑️ Deinstallation

### Über Windows Einstellungen

1. **Windows Einstellungen** öffnen
2. **Apps** → **Apps & Features**
3. **"InfoBot Agent"** suchen
4. **Deinstallieren** klicken

### Über Systemsteuerung

1. **Systemsteuerung** → **Programme und Features**
2. **"InfoBot Agent"** auswählen
3. **Deinstallieren** klicken

### Manuelle Bereinigung

Falls nötig, bereinigen Sie manuell:
```powershell
# Service stoppen und entfernen
Stop-Service "InfoBot Agent" -Force
sc.exe delete "InfoBot Agent"

# Programmdateien löschen
Remove-Item "C:\Program Files\InfoBot Agent" -Recurse -Force

# Daten löschen (optional)
Remove-Item "$env:ProgramData\InfoBot" -Recurse -Force

# Registry-Einträge löschen
Remove-Item "HKLM:\SOFTWARE\InfoBot" -Recurse -Force
```

## 📞 Support

Bei Problemen:

1. Prüfen Sie die [Troubleshooting-Sektion](#-troubleshooting)
2. Überprüfen Sie die Agent-Logs: `%ProgramData%\InfoBot\logs\`
3. Öffnen Sie ein [GitHub Issue](https://github.com/r-hagi/InfoBot/issues)
4. Geben Sie folgende Informationen an:
   - Windows-Version
   - Browser-Version  
   - Agent-Version
   - Relevante Log-Einträge

## 🔄 Updates

InfoBot prüft automatisch auf Updates:

- **PWA**: Updates automatisch über Service Worker
- **Agent**: Neue Versionen über GitHub Releases
  - Laden Sie den neuen Installer herunter
  - Führen Sie ihn aus (überschreibt die alte Version)

---

**🎉 Viel Erfolg mit InfoBot!** 