import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { query } from '../config/db';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, name, description, state, reason, updated_at FROM services ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: result.rows,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
    console.error(`[${correlationId}] Error fetching services:`, error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve services status',
        correlationId
      }
    });
  }
};

export const updateServiceStatus = async (req: Request, res: Response): Promise<void> => {
  const correlationId = req.headers['x-correlation-id'] as string || crypto.randomUUID();
  const { id } = req.params;
  const { state, reason } = req.body;
  
  // The user object is expected to be populated by the JWT authentication middleware
  const user = (req as any).user;

  if (!state) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Service state is required',
        correlationId
      }
    });
    return;
  }

  try {
    await query('BEGIN');

    const updateResult = await query(
      'UPDATE services SET state = $1, reason = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, description, state, reason, updated_at',
      [state, reason || null, id]
    );

    if (updateResult.rows.length === 0) {
      await query('ROLLBACK');
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Service not found',
          correlationId
        }
      });
      return;
    }

    const updatedService = updateResult.rows[0];

    // Insert audit log for the administrative action
    await query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, user_id, user_name, details, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        'UPDATE_SERVICE_STATUS',
        'SERVICE',
        id,
        user?.id || 'UNKNOWN',
        user?.username || 'UNKNOWN',
        JSON.stringify({ previous_state: null, new_state: state, reason })
      ]
    );

    await query('COMMIT');

    res.json({
      success: true,
      data: updatedService,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error(`[${correlationId}] Error updating service status:`, error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update service status',
        correlationId
      }
    });
  }
};