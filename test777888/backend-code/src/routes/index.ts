import { Router } from 'express';
import { login, getMe } from '../controllers/authController';
import { getNews, createNews } from '../controllers/newsController';
import { getServices, updateServiceStatus } from '../controllers/servicesController';
import { getActiveAnnouncements, acknowledgeAnnouncement } from '../controllers/announcementsController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

export const apiRouter = Router();

// Auth Routes
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', authenticateJWT, getMe);

// News Routes
apiRouter.get('/news', authenticateJWT, getNews);
apiRouter.post('/news', authenticateJWT, requireRole('Admin'), createNews);

// Announcements Routes
apiRouter.get('/announcements/active', authenticateJWT, getActiveAnnouncements);
apiRouter.post('/announcements/:id/acknowledge', authenticateJWT, acknowledgeAnnouncement);

// Services Routes
apiRouter.get('/services/status', authenticateJWT, getServices);
apiRouter.patch('/services/:id/status', authenticateJWT, requireRole('IT Ops'), updateServiceStatus);