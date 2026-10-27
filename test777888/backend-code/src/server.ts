import express, { Application, Request, Response, NextFunction } from 'express';
import { apiRouter } from './routes/index';
import { AppError, errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Parse incoming JSON requests
app.use(express.json());

// Mount API routes (versioned as per API specification)
app.use('/api/v1', apiRouter);

// Handle unmapped routes (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.originalUrl}`) as Error & AppError;
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
});

// Global error handling middleware
app.use(errorHandler);

// Validate required environment variables
const PORT = process.env.PORT;
if (!PORT) {
  console.error('FATAL ERROR: PORT environment variable is missing.');
  process.exit(1);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});