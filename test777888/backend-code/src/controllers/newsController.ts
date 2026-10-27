import { Request, Response } from 'express';
import { query } from '../db';
import crypto from 'crypto';

export const getNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
        const category = req.query.category as string;
        const offset = (page - 1) * pageSize;

        let sql = 'SELECT id, title, summary, content, category, status, author_id, published_at, created_at, updated_at FROM news WHERE status = $1';
        const params: any[] = ['published'];

        if (category) {
            params.push(category);
            sql += ` AND category = $${params.length}`;
        }

        sql += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageSize, offset);

        const result = await query(sql, params);

        let countSql = 'SELECT COUNT(*) FROM news WHERE status = $1';
        const countParams: any[] = ['published'];
        if (category) {
            countParams.push(category);
            countSql += ` AND category = $${countParams.length}`;
        }
        
        const countResult = await query(countSql, countParams);
        const totalItems = parseInt(countResult.rows[0].count, 10);

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
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve news articles',
                correlationId: crypto.randomUUID()
            }
        });
    }
};

export const createNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, summary, content, category, status } = req.body;
        
        // Assuming user identity is attached to req by JWT middleware
        const authorId = (req as any).user?.upn || 'system';
        const finalStatus = status || 'draft';
        const publishedAt = finalStatus === 'published' ? new Date() : null;

        const sql = `
            INSERT INTO news (title, summary, content, category, status, author_id, published_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING id, title, summary, content, category, status, author_id, published_at, created_at, updated_at
        `;
        
        const params = [title, summary, content, category, finalStatus, authorId, publishedAt];
        const result = await query(sql, params);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            metadata: { timestamp: new Date().toISOString() }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create news article',
                correlationId: crypto.randomUUID()
            }
        });
    }
};