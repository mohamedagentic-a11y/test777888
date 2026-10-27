import { Request, Response } from 'express';
import { query } from '../db';

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, name, state, reason, updated_at FROM services ORDER BY name ASC');
    
    res.json({
      success: true,
      data: result.rows,
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve service status',
        correlationId: req.headers['x-correlation-id'] || 'unknown'
      }
    });
  }
};

export const updateServiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { state, reason } = req.body;

    if (!state) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'State is required',
          correlationId: req.headers['x-correlation-id'] || 'unknown'
        }
      });
      return;
    }

    const result = await query(
      'UPDATE services SET state = $1, reason = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, state, reason, updated_at',
      [state, reason || null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Service not found',
          correlationId: req.headers['x-correlation-id'] || 'unknown'
        }
      });
      return;
    }

    res.json({
      success: true,
      data: result.rows[0],
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update service status',
        correlationId: req.headers['x-correlation-id'] || 'unknown'
      }
    });
  }
};