import { Request, Response } from 'express';
import { query } from '../db';
import * as crypto from 'crypto';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        adGroups: string[];
    };
}

function sendSuccess(res: Response, data: any, statusCode = 200) {
    res.status(statusCode).json({
        success: true,
        data,
        metadata: {
            timestamp: new Date().toISOString()
        }
    });
}

function sendError(res: Response, code: string, message: string, statusCode = 500) {
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            correlationId: crypto.randomUUID()
        }
    });
}

export const getActiveAnnouncements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userGroups = req.user?.adGroups || [];
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, 'UNAUTHORIZED', 'User identity not found', 401);
        }

        const sql = `
            SELECT a.id, a.title, a.content, a.priority, a.created_at
            FROM announcements a
            WHERE a.is_active = true 
              AND (a.valid_until IS NULL OR a.valid_until > NOW())
              AND (
                  a.target_groups IS NULL 
                  OR a.target_groups && $1::text[]
              )
              AND NOT EXISTS (
                  SELECT 1 FROM announcement_acknowledgments ack 
                  WHERE ack.announcement_id = a.id AND ack.user_id = $2
              )
            ORDER BY a.priority DESC, a.created_at DESC
        `;

        const result = await query(sql, [userGroups, userId]);
        sendSuccess(res, result.rows);
    } catch (error) {
        console.error('Error fetching active announcements:', error);
        sendError(res, 'FETCH_ANNOUNCEMENTS_FAILED', 'Failed to retrieve active announcements');
    }
};

export const acknowledgeAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return sendError(res, 'UNAUTHORIZED', 'User identity not found', 401);
        }

        if (!id) {
            return sendError(res, 'INVALID_REQUEST', 'Announcement ID is required', 400);
        }

        const sql = `
            INSERT INTO announcement_acknowledgments (announcement_id, user_id, acknowledged_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (announcement_id, user_id) DO NOTHING
        `;

        await query(sql, [id, userId]);
        sendSuccess(res, { acknowledged: true, announcementId: id });
    } catch (error) {
        console.error('Error acknowledging announcement:', error);
        sendError(res, 'ACKNOWLEDGE_FAILED', 'Failed to acknowledge announcement');
    }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { title, content, priority, validUntil, targetGroups } = req.body;
        const createdBy = req.user?.id;

        if (!createdBy) {
            return sendError(res, 'UNAUTHORIZED', 'User identity not found', 401);
        }

        if (!title || !content) {
            return sendError(res, 'INVALID_REQUEST', 'Title and content are required', 400);
        }

        const sql = `
            INSERT INTO announcements (title, content, priority, valid_until, target_groups, created_by, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id, title, content, priority, valid_until, target_groups, created_at
        `;

        const params = [
            title,
            content,
            priority || 0,
            validUntil || null,
            targetGroups || null,
            createdBy
        ];

        const result = await query(sql, params);
        sendSuccess(res, result.rows[0], 201);
    } catch (error) {
        console.error('Error creating announcement:', error);
        sendError(res, 'CREATE_ANNOUNCEMENT_FAILED', 'Failed to create announcement');
    }
};