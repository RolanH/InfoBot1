import path from 'path';
import os from 'os';
import { AgentConfig } from './types';

const isDevelopment = process.env.NODE_ENV === 'development';
const programDataPath = process.env.PROGRAMDATA || path.join(os.homedir(), 'AppData', 'Local');
const toolDataPath = path.join(programDataPath, 'InfoBot');

export const config: AgentConfig = {
  port: 3210,
  host: '127.0.0.1',
  tokenPath: path.join(toolDataPath, 'token.txt'),
  scriptPath: path.join(__dirname, '..', 'scripts', 'example.ps1'),
  allowedOrigins: isDevelopment 
    ? ['http://localhost:5173', 'http://127.0.0.1:5173']
    : ['https://r-hagi.github.io'],
  maxExecutionTime: 30000, // 30 seconds
  logLevel: isDevelopment ? 'debug' : 'info',
  logPath: path.join(toolDataPath, 'logs'),
};

export const packageVersion = process.env.npm_package_version || '1.0.0';
export const buildDate = process.env.BUILD_DATE || new Date().toISOString(); 