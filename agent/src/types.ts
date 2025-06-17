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

export interface AgentConfig {
  port: number;
  host: string;
  tokenPath: string;
  scriptPath: string;
  allowedOrigins: string[];
  maxExecutionTime: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  logPath: string;
}

import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  headers: {
    'x-agent-token': string;
    [key: string]: string | string[] | undefined;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
} 