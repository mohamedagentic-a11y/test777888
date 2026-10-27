import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';

export const login = async (req: Request, res: Response) => {
  try {
    // IISNode passes the authenticated Windows user in this header
    const logonUser = req.headers['x-iisnode-logon_user'] || req.headers['remote-user'];
    
    if (!logonUser || typeof logonUser !== 'string') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Windows Authentication failed or missing headers',
          correlationId: crypto.randomUUID ? crypto.randomUUID() : 'auth-1'
        }
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing');
    }

    // Extract username from DOMAIN\username
    const username = logonUser.includes('\\') ? logonUser.split('\\')[1] : logonUser;

    // Issue JWT with the AD identity
    const token = jwt.sign(
      { username, logonUser },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      data: { token, username, logonUser },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
        correlationId: crypto.randomUUID ? crypto.randomUUID() : 'auth-2'
      }
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // The JWT middleware should set req.user before this handler is called
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
          correlationId: crypto.randomUUID ? crypto.randomUUID() : 'auth-3'
        }
      });
    }

    return res.json({
      success: true,
      data: { user },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred fetching user profile',
        correlationId: crypto.randomUUID ? crypto.randomUUID() : 'auth-4'
      }
    });
  }
};