import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, authorizeGroups, AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const servicesRouter = Router();

/**
 * GET /api/services/status
 * Publicly accessible (authenticated) list of all IT services and their current status.
 */
servicesRouter.get('/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const services = await prisma.serviceStatus.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json(services);
  } catch (error) {
    console.error('Error fetching service status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/services/status/:id
 * Updates a service status. Restricted to IT_ADMINS group.
 * Logs the action to the audit log.
 */
servicesRouter.post(
  '/status/:id',
  authMiddleware,
  authorizeGroups(['IT_ADMINS']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { status, message } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'User context missing' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const updatedService = await tx.serviceStatus.update({
          where: { id: parseInt(id) },
          data: {
            status,
            message,
            updatedAt: new Date(),
            updatedBy: user.username,
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'UPDATE_SERVICE_STATUS',
            resource: 'ServiceStatus',
            resourceId: id,
            username: user.username,
            displayName: user.displayName,
            details: JSON.stringify({ status, message }),
            timestamp: new Date(),
          },
        });

        return updatedService;
      });

      return res.json(result);
    } catch (error) {
      console.error('Error updating service status:', error);
      return res.status(500).json({ error: 'Failed to update service status' });
    }
  }
);

/**
 * GET /api/services/audit-logs
 * Retrieves audit logs. Restricted to AUDIT_ADMINS or IT_ADMINS.
 */
servicesRouter.get(
  '/audit-logs',
  authMiddleware,
  authorizeGroups(['IT_ADMINS', 'AUDIT_ADMINS']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
      return res.json(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export { servicesRouter };