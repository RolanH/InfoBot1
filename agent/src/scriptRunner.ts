import { execFile } from 'child_process';
import { promisify } from 'util';
import { config } from './config';
import { logger } from './logger';
import { ScriptResult } from './types';

const execFileAsync = promisify(execFile);

export class ScriptRunner {
  public async executeScript(): Promise<ScriptResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Starting script execution: ${config.scriptPath}`);

      const { stdout, stderr } = await execFileAsync(
        'powershell.exe',
        ['-ExecutionPolicy', 'Bypass', '-File', config.scriptPath],
        {
          timeout: config.maxExecutionTime,
          windowsHide: true,
          encoding: 'utf8'
        }
      );

      const duration = Date.now() - startTime;
      const result: ScriptResult = {
        exitCode: 0,
        stdout: stdout || '',
        stderr: stderr || '',
        durationMs: duration
      };

      logger.info(`Script executed successfully in ${duration}ms`);
      return result;

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      if (error.killed && error.signal === 'SIGTERM') {
        logger.error(`Script execution timed out after ${config.maxExecutionTime}ms`);
        return {
          exitCode: -1,
          stdout: '',
          stderr: 'Script execution timed out',
          durationMs: duration
        };
      }

      const exitCode = error.code || -1;
      const stderr = error.stderr || error.message || 'Unknown error';
      
      logger.error(`Script execution failed with exit code ${exitCode}: ${stderr}`);
      
      return {
        exitCode,
        stdout: error.stdout || '',
        stderr,
        durationMs: duration
      };
    }
  }

  public validateScriptExists(): boolean {
    try {
      const fs = require('fs');
      return fs.existsSync(config.scriptPath);
    } catch (error) {
      logger.error('Failed to check script existence', error);
      return false;
    }
  }
}

export const scriptRunner = new ScriptRunner(); 