import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { config } from './config';

// Ensure log directory exists
if (!fs.existsSync(config.logPath)) {
  fs.mkdirSync(config.logPath, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports: [
    // File transport with rotation
    new winston.transports.File({
      filename: path.join(config.logPath, 'agent.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Error file
    new winston.transports.File({
      filename: path.join(config.logPath, 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true
    })
  ],
  exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger; 