export interface ScriptResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface VersionInfo {
  version: string;
  buildDate: string;
}

export interface TokenInfo {
  token: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: number;
  uptime: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AgentStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastPing?: number;
  version?: string;
  error?: string | undefined;
}

export interface ScriptExecutionState {
  isExecuting: boolean;
  result?: ScriptResult | undefined;
  error?: ApiError | undefined;
  startTime?: number | undefined;
} 