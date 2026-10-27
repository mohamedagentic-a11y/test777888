import { Request, Response } from 'express';
import { query } from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    groups: string[];
  };
}

export const getActiveAnnouncements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          correlationId: req.headers['x-correlation-id'] || 'unknown'
        }
      });
      return;
    }

    const sql = `
      SELECT a.id, a.title, a.content, a.priority, a.created_at
      FROM announcements a
      WHERE a.is_active = true
        AND a.id NOT IN (
          SELECT announcement_id 
          FROM announcement_acknowledgments 
          WHERE user_id = $1
        )
      ORDER BY a.priority DESC, a.created_at DESC
    `;
    
    const result = await query(sql, [user.id]);

    res.json({
      success: true,
      data: result.rows,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch announcements',
        correlationId: req.headers['x-correlation-id'] || 'unknown'
      }
    });
  }
};

export const acknowledgeAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
          correlationId: req.headers['x-correlation-id'] || 'unknown'
        }
      });
      return;
    }

    const announcementId = req.params.id;
    if (!announcementId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Announcement ID is required',
          correlationId: req.headers['x-correlation-id'] || 'unknown'
        }
      });
      return;
    }

    const sql = `
      INSERT INTO announcement_acknowledgments (announcement_id, user_id, acknowledged_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (announcement_id, user_id) DO NOTHING
    `;

    await query(sql, [announcementId, user.id]);

    res.json({
      success: true,
      data: { acknowledged: true },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error acknowledging announcement:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to acknowledge announcement',
        correlationId: req.headers['x-correlation-id'] || 'unknown'
      }
    });
  }
};