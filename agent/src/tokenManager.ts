import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { logger } from './logger';

export class TokenManager {
  private token: string | null = null;

  constructor() {
    this.ensureTokenDirectory();
    this.loadOrGenerateToken();
  }

  private ensureTokenDirectory(): void {
    const tokenDir = path.dirname(config.tokenPath);
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir, { recursive: true });
      logger.info(`Created token directory: ${tokenDir}`);
    }
  }

  private loadOrGenerateToken(): void {
    try {
      if (fs.existsSync(config.tokenPath)) {
        this.token = fs.readFileSync(config.tokenPath, 'utf8').trim();
        logger.info('Token loaded from file');
      } else {
        this.generateAndSaveToken();
      }
    } catch (error) {
      logger.error('Failed to load token, generating new one', error);
      this.generateAndSaveToken();
    }
  }

  private generateAndSaveToken(): void {
    try {
      // Generate 256-bit (32 bytes) random token
      this.token = crypto.randomBytes(32).toString('base64');
      fs.writeFileSync(config.tokenPath, this.token, { mode: 0o600 });
      logger.info('New token generated and saved');
    } catch (error) {
      logger.error('Failed to generate or save token', error);
      throw new Error('Token generation failed');
    }
  }

  public getToken(): string {
    if (!this.token) {
      throw new Error('Token not available');
    }
    return this.token;
  }

  public validateToken(providedToken: string): boolean {
    if (!this.token) {
      logger.warn('No token available for validation');
      return false;
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(this.token, 'base64'),
      Buffer.from(providedToken, 'base64')
    );

    if (!isValid) {
      logger.warn('Invalid token provided');
    }

    return isValid;
  }

  public regenerateToken(): string {
    logger.info('Regenerating token');
    this.generateAndSaveToken();
    return this.getToken();
  }
}

export const tokenManager = new TokenManager(); 