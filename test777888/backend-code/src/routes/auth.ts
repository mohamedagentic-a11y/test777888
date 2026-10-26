import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const authRouter = Router();

/**
 * POST /api/auth/login
 * Handles the exchange of AD-authenticated identity for a JWT.
 * In this architecture, IIS handles the NTLM/Kerberos negotiation and 
 * passes the identity to Node.js. This endpoint issues the application token.
 */
authRouter.post('/login', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication failed: No identity provided by host.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET is not configured.');
    return res.status(500).json({ message: 'Internal server configuration error.' });
  }

  try {
    const token = jwt.sign(
      {
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        groups: user.groups
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        groups: user.groups
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate session token.' });
  }
});

/**
 * GET /api/auth/profile
 * Returns the current authenticated user's profile information based on the JWT.
 */
authRouter.get('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  return res.json(req.user);
});

/**
 * POST /api/auth/logout
 * Client-side logout is handled by discarding the JWT. 
 * This endpoint provides a hook for any server-side cleanup if required in the future.
 */
authRouter.post('/logout', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

export { authRouter };