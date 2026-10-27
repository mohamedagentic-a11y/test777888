import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';

export const login = async (req: Request, res: Response) => {
    // In an IISNode environment with Windows Authentication enabled, 
    // the authenticated username is passed via headers.
    const username = req.headers['x-iisnode-logon_user'] || req.headers['remote-user'] || (req as any).user?.username;

    if (!username) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Windows authentication failed or missing.',
                correlationId: 'auth-login'
            }
        });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is missing');
    }

    try {
        // Issue JWT token for subsequent API requests
        const token = jwt.sign({ username }, jwtSecret, { expiresIn: '8h' });

        return res.json({
            success: true,
            data: { token, username },
            metadata: { timestamp: new Date().toISOString() }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to generate token',
                correlationId: 'auth-login-error'
            }
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    if (!user) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Not authenticated',
                correlationId: 'auth-getme'
            }
        });
    }

    return res.json({
        success: true,
        data: { user },
        metadata: { timestamp: new Date().toISOString() }
    });
};