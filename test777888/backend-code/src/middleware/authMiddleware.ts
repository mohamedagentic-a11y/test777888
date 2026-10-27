import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        roles: string[];
        [key: string]: any;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

/**
 * Middleware to authenticate requests using JWT.
 * It also checks for IIS AD user headers as a fallback or initial context if applicable.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid or expired token',
          }
        });
        return;
      }

      req.user = decoded as Express.Request['user'];
      next();
    });
  } else {
    // Check if IIS passed the authenticated user (e.g., via iisnode)
    const iisUser = req.headers['x-iisnode-logon_user'] as string;
    if (iisUser) {
      // In a real scenario, you might want to map this to roles or issue a JWT.
      // For this middleware, we just attach it if JWT is missing but IIS authenticated them.
      req.user = {
        username: iisUser,
        roles: [] // Roles would typically be fetched from DB or AD here
      };
      next();
    } else {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required',
        }
      });
    }
  }
};

/**
 * Middleware to enforce role-based access control.
 * @param requiredRoles A single role or an array of roles required to access the route.
 */
export const requireRole = (requiredRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        }
      });
      return;
    }

    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const userRoles = req.user.roles || [];

    const hasRole = rolesToCheck.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to access this resource',
        }
      });
      return;
    }

    next();
  };
};