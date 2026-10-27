import { Request, Response } from 'express';
import { query } from '../config/db';

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const category = req.query.category as string;
    const offset = (page - 1) * pageSize;

    let sql = 'SELECT id, title, summary, category, published_at, author FROM news WHERE published = true';
    const params: any[] = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, offset);

    const result = await query(sql, params);

    const countSql = category 
      ? 'SELECT COUNT(*) FROM news WHERE published = true AND category = $1'
      : 'SELECT COUNT(*) FROM news WHERE published = true';
    const countParams = category ? [category] : [];
    const countResult = await query(countSql, countParams);
    const totalItems = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        items: result.rows,
        pagination: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize)
        }
      },
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve news articles',
        correlationId: req.headers['x-correlation-id'] || 'unknown'
      }
    });
  }
};

export const createNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, summary, content, category, published } = req.body;
    const author = (req as any).user?.username || 'system'; // Assuming user is set by auth middleware

    if (!title || !content) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and content are required',
          correlationId: req.headers['x-correlation-id'] || 'unknown'
        }
      });
      return;
    }

    const sql = `
      INSERT INTO news (title, summary, content, category, published, author, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, summary, category, published_at, author
    `;
    const params = [
      title,
      summary || null,
      content,
      category || 'General',
      published || false,
      author,
      published ? new Date() : null
    ];

    const result = await query(sql, params);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      metadata: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create news article',
        correlationId: req.headers['x-correlation-id'] || 'unknown'
      }
    });
  }
};