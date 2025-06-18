import { useState } from 'react';
import { useAgentStatus } from '@/hooks/useAgentStatus';
import { useScriptRunner } from '@/hooks/useScriptRunner';

// Components
function StatusIndicator({ status, isChecking }: { status: any; isChecking: boolean }) {
  if (isChecking) {
    return (
      <div className="status-indicator status-checking">
        <div className="loading-spinner"></div>
        <span>Überprüfe Agent Status...</span>
      </div>
    );
  }

  if (status.isOnline) {
    return (
      <div className="status-indicator status-online">
        <div className="status-dot"></div>
        <span>Agent Online (v{status.version})</span>
      </div>
    );
  }

  return (
    <div className="status-indicator status-offline">
      <div className="status-dot"></div>
      <span>Agent Offline</span>
    </div>
  );
}

function SetupInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>InfoBot Agent Setup</h2>
        <p>Der InfoBot Agent ist nicht erreichbar. Bitte folgen Sie diesen Schritten:</p>
        
        <ol style={{ margin: '1rem 0', paddingLeft: '1.5rem' }}>
          <li>Laden Sie den InfoBot Agent Installer herunter</li>
          <li>Führen Sie die Installation als Administrator aus</li>
          <li>Der Agent wird automatisch als Windows Service gestartet</li>
          <li>Laden Sie diese Seite neu</li>
        </ol>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button className="button primary" onClick={onClose}>
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}

function ScriptOutput({ result, error }: { result?: any; error?: any }) {
  if (error) {
    return (
      <div className="error-message">
        <strong>Fehler bei der Skript-Ausführung:</strong>
        <div>{error.message}</div>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = result.exitCode === 0;
  
  return (
    <div>
      <div className={isSuccess ? 'success-message' : 'error-message'}>
        <strong>
          Skript {isSuccess ? 'erfolgreich' : 'fehlgeschlagen'} ausgeführt 
          (Exit Code: {result.exitCode}, Dauer: {result.durationMs}ms)
        </strong>
      </div>
      
      {result.stdout && (
        <div>
          <h3>Ausgabe:</h3>
          <div className="output-container">{result.stdout}</div>
        </div>
      )}
      
      {result.stderr && (
        <div>
          <h3>Fehlerausgabe:</h3>
          <div className="output-container">{result.stderr}</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { status, isChecking, refreshStatus } = useAgentStatus();
  const { executeScript, clearResult, isExecuting, result, error } = useScriptRunner();
  const [showSetup, setShowSetup] = useState(false);

  const handleExecuteScript = async () => {
    if (!status.isOnline) {
      setShowSetup(true);
      return;
    }

    try {
      await executeScript();
    } catch (error) {
      console.error('Script execution failed:', error);
    }
  };

  const handleClearResults = () => {
    clearResult();
  };

  return (
    <div>
      <header className="header">
        <h1>InfoBot Script Runner</h1>
      </header>

      <main className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <StatusIndicator status={status} isChecking={isChecking} />
            <button 
              className="button secondary" 
              onClick={refreshStatus}
              disabled={isChecking}
            >
              Aktualisieren
            </button>
          </div>

          {status.error && (
            <div className="error-message">
              <strong>Verbindungsfehler:</strong> {status.error}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Skript Ausführung</h2>
          <p>Klicken Sie auf den Button, um das vordefinierte Skript auszuführen.</p>
          
          <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            <button
              className="button primary"
              onClick={handleExecuteScript}
              disabled={isExecuting || !status.isOnline}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              {isExecuting && <div className="loading-spinner"></div>}
              {isExecuting ? 'Skript wird ausgeführt...' : 'Skript Ausführen'}
            </button>
          </div>

          {(result || error) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Ergebnis:</h3>
                <button className="button secondary" onClick={handleClearResults}>
                  Ergebnis löschen
                </button>
              </div>
              <ScriptOutput result={result} error={error} />
            </div>
          )}
        </div>

        <div className="card">
          <h3>Über InfoBot</h3>
          <p>
            InfoBot ermöglicht die sichere Ausführung von vordefinierten Skripten 
            über eine Progressive Web App. Der lokale Agent läuft als Windows Service 
            und kommuniziert nur mit dieser Anwendung.
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            Version: 1.0.0 | Agent: {status.version || 'Unbekannt'}
          </p>
        </div>
      </main>

      {showSetup && <SetupInstructions onClose={() => setShowSetup(false)} />}
    </div>
  );
}