import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        roles: string[];
      };
    }
  }
}

/**
 * Extracts IIS Windows Auth headers (LOGON_USER) and attaches the user to the request.
 * This is used for the initial login endpoint.
 */
export const authenticateAD = (req: Request, res: Response, next: NextFunction) => {
  // IIS passes the authenticated user in the x-iisnode-logon_user header when using iisnode
  // or a custom header configured in the reverse proxy.
  const logonUser = req.headers['x-iisnode-logon_user'] || req.headers['x-ms-client-principal-name'];

  if (!logonUser || typeof logonUser !== 'string') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Windows Authentication failed. Missing LOGON_USER header.',
      },
    });
  }

  // In a real AD environment, we would query AD for groups here.
  // For this middleware, we just set the username and an empty roles array
  // which the login controller will populate before issuing the JWT.
  req.user = {
    username: logonUser.split('\\').pop() || logonUser, // Handle DOMAIN\username
    roles: [],
  };

  next();
};

/**
 * Validates the JWT Bearer token for subsequent API requests.
 */
export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header.',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('JWT_SECRET environment variable is missing.');
    process.exit(1);
  }

  try {
    const decoded = jwt.verify(token, secret) as { username: string; roles: string[] };
    req.user = {
      username: decoded.username,
      roles: decoded.roles || [],
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token.',
      },
    });
  }
};

/**
 * Middleware to enforce role-based access control based on AD Group claims in the JWT.
 * @param requiredRoles Array of roles (AD Groups) allowed to access the route.
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated.',
        },
      });
    }

    const hasRole = req.user.roles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to access this resource.',
        },
      });
    }

    next();
  };
};