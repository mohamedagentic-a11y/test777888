import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { newsRouter } from './routes/news';
import { servicesRouter } from './routes/services';

// Load environment variables
dotenv.config();

/**
 * Backend entry point for eStaff Portal Revamp.
 * Configures Express server with security middleware, routing, and error handling.
 * Architecture: Monolithic Layered Architecture (Client-Server).
 */
const app = express();
const port = process.env.PORT || 3001;

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL is not defined.');
  process.exit(1);
}

// Security Middleware
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// CORS configuration - restricted to application needs
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Standard body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 * Following the architecture/api-specification.md and LLD_Document.md
 */
app.use('/api/auth', authRouter);
app.use('/api/news', newsRouter);
app.use('/api/services', servicesRouter);

/**
 * Health Check Endpoint
 * Used for monitoring and IIS application pool readiness checks.
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

/**
 * Global Error Handler
 * Implements generic error handling to prevent diagnostic exposure per NFRs.
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${err.stack || err}`);
  
  const statusCode = err.status || 500;
  const message = statusCode === 500 
    ? 'An internal server error occurred.' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString()
  });
});

/**
 * Server Initialization
 */
const server = app.listen(port, () => {
  console.log(`eStaff Portal Backend listening on port ${port}`);
});

// Handle graceful shutdown for Windows Server / IIS environment
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;