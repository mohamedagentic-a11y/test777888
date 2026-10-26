import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, authorizeGroups, AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const newsRouter = Router();

/**
 * GET /api/news
 * Fetches all active news items.
 * Accessible to all authenticated users.
 */
newsRouter.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const news = await prisma.news.findMany({
      where: {
        published: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news items' });
  }
});

/**
 * GET /api/news/:id
 * Fetches a single news item by ID.
 */
newsRouter.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const newsItem = await prisma.news.findUnique({
      where: { id: Number(id) }
    });

    if (!newsItem) {
      return res.status(404).json({ error: 'News item not found' });
    }

    res.json(newsItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news item' });
  }
});

/**
 * POST /api/news
 * Creates a new news item.
 * Restricted to 'Admin' or 'Communications' groups.
 */
newsRouter.post('/', authMiddleware, authorizeGroups(['Admin', 'Communications']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, summary, imageUrl, expiresAt, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newsItem = await prisma.news.create({
      data: {
        title,
        content,
        summary,
        imageUrl,
        published: published ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        authorId: req.user?.username || 'system'
      }
    });

    // Audit Log Entry
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_NEWS',
        entity: 'News',
        entityId: newsItem.id.toString(),
        performedBy: req.user?.username || 'system',
        details: `Created news item: ${title}`
      }
    });

    res.status(201).json(newsItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create news item' });
  }
});

/**
 * PUT /api/news/:id
 * Updates an existing news item.
 * Restricted to 'Admin' or 'Communications' groups.
 */
newsRouter.put('/:id', authMiddleware, authorizeGroups(['Admin', 'Communications']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, summary, imageUrl, expiresAt, published } = req.body;

    const existing = await prisma.news.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'News item not found' });
    }

    const updatedNews = await prisma.news.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        summary,
        imageUrl,
        published,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_NEWS',
        entity: 'News',
        entityId: id,
        performedBy: req.user?.username || 'system',
        details: `Updated news item: ${title}`
      }
    });

    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update news item' });
  }
});

/**
 * DELETE /api/news/:id
 * Deletes a news item.
 * Restricted to 'Admin' or 'Communications' groups.
 */
newsRouter.delete('/:id', authMiddleware, authorizeGroups(['Admin', 'Communications']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.news.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'News item not found' });
    }

    await prisma.news.delete({
      where: { id: Number(id) }
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_NEWS',
        entity: 'News',
        entityId: id,
        performedBy: req.user?.username || 'system',
        details: `Deleted news item: ${existing.title}`
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete news item' });
  }
});

export { newsRouter };