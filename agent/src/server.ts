import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config, packageVersion, buildDate } from './config';
import { logger } from './logger';
import { tokenManager } from './tokenManager';
import { scriptRunner } from './scriptRunner';
import { ScriptResult, VersionInfo, TokenInfo, HealthStatus, ApiError } from './types';

const app = express();
const startTime = Date.now();

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Agent-Token']
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Token validation middleware
function validateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-agent-token'] as string;
  
  if (!token) {
    const error: ApiError = {
      code: 'MISSING_TOKEN',
      message: 'X-Agent-Token header is required'
    };
    return res.status(401).json(error);
  }

  try {
    if (!tokenManager.validateToken(token)) {
      const error: ApiError = {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      };
      return res.status(401).json(error);
    }
    next();
  } catch (error) {
    logger.error('Token validation error', error);
    const apiError: ApiError = {
      code: 'TOKEN_VALIDATION_ERROR',
      message: 'Token validation failed'
    };
    return res.status(500).json(apiError);
  }
}

// Routes

// Health check endpoint (no auth required)
app.get('/health', (req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'ok',
    timestamp: Date.now(),
    uptime: Date.now() - startTime
  };
  res.json(health);
});

// Version endpoint (no auth required)
app.get('/version', (req: Request, res: Response) => {
  const version: VersionInfo = {
    version: packageVersion,
    buildDate: buildDate
  };
  res.json(version);
});

// Token endpoint (no auth required - localhost only)
app.get('/token', (req: Request, res: Response) => {
  try {
    const token: TokenInfo = {
      token: tokenManager.getToken()
    };
    res.json(token);
  } catch (error) {
    logger.error('Failed to get token', error);
    const apiError: ApiError = {
      code: 'TOKEN_UNAVAILABLE',
      message: 'Authentication token is not available'
    };
    res.status(500).json(apiError);
  }
});

// Script execution endpoint (requires auth)
app.post('/run', validateToken, async (req: Request, res: Response) => {
  try {
    if (!scriptRunner.validateScriptExists()) {
      const error: ApiError = {
        code: 'SCRIPT_NOT_FOUND',
        message: 'Script file not found'
      };
      return res.status(404).json(error);
    }

    const result: ScriptResult = await scriptRunner.executeScript();
    res.json(result);
  } catch (error) {
    logger.error('Script execution error', error);
    const apiError: ApiError = {
      code: 'SCRIPT_EXECUTION_ERROR',
      message: 'Failed to execute script',
      details: error
    };
    res.status(500).json(apiError);
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  const error: ApiError = {
    code: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.path} not found`
  };
  res.status(404).json(error);
});

// Error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', error);
  const apiError: ApiError = {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error'
  };
  res.status(500).json(apiError);
});

// Start server
function startServer() {
  const server = app.listen(config.port, config.host, () => {
    logger.info(`InfoBot Agent started on ${config.host}:${config.port}`);
    logger.info(`Allowed origins: ${config.allowedOrigins.join(', ')}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  });

  return server;
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export { app, startServer }; 