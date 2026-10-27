import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Retrieve existing correlation ID from request if available, otherwise generate a new one
  const correlationId = (req as any).correlationId || randomUUID();

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  
  // Prevent stack trace leaks: only expose actual error messages for client errors (4xx).
  // For server errors (5xx), use a generic user-friendly message.
  const message = statusCode < 500 
    ? err.message 
    : 'An unexpected error occurred. Please try again later or contact support.';

  // Log the full error internally for debugging and audit purposes
  console.error(`[CorrelationID: ${correlationId}] ${err.name}: ${err.message}`, err.stack);

  // Return the standardized error response as per API specification
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      correlationId: correlationId
    }
  });
};