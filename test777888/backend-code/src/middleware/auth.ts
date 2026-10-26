import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Interface representing the structure of the JWT payload.
 * Contains the user's AD identity and group memberships.
 */
export interface AuthUser {
  username: string;
  displayName: string;
  email: string;
  groups: string[];
}

/**
 * Extension of the Express Request object to include the authenticated user.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * authMiddleware
 * 
 * Validates the JWT bearer token provided in the Authorization header.
 * The token is expected to be issued after successful Windows AD negotiation.
 * 
 * Architecture Compliance:
 * - Uses JWT for stateless session management as per HLD.
 * - Validates AD group-based authorization attributes.
 * - Fails if JWT_SECRET is missing from the environment.
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('CRITICAL: JWT_SECRET environment variable is not defined.');
    return res.status(500).json({
      message: 'Internal server configuration error.',
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;

    // Ensure the decoded token has the required identity fields
    if (!decoded.username || !decoded.groups) {
      return res.status(401).json({
        message: 'Invalid token payload: missing identity attributes.',
      });
    }

    // Attach the user identity to the request object for downstream controllers
    req.user = {
      username: decoded.username,
      displayName: decoded.displayName,
      email: decoded.email,
      groups: decoded.groups,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: 'Session expired. Please log in again.',
      });
    }
    
    return res.status(401).json({
      message: 'Invalid or tampered authentication token.',
    });
  }
};

/**
 * authorizeGroups
 * 
 * Higher-order middleware to restrict access to specific AD groups.
 * Used for administrative modules or restricted enterprise tools.
 */
export const authorizeGroups = (allowedGroups: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    const hasAccess = req.user.groups.some((group) => allowedGroups.includes(group));

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access denied. Insufficient AD group permissions.',
      });
    }

    next();
  };
};