import express, { Request, Response, NextFunction } from 'express';
import { authenticateAD, verifyJWT, requireRole } from './middleware/authMiddleware';
import { login, getMe } from './controllers/authController';
import { getServices, updateServiceStatus } from './controllers/servicesController';
import { getNews, createNews } from './controllers/newsController';
import { getActiveAnnouncements, acknowledgeAnnouncement, createAnnouncement } from './controllers/announcementsController';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Auth Routes
app.post('/api/auth/login', authenticateAD, login);
app.get('/api/auth/me', verifyJWT, getMe);

// News Routes
app.get('/api/news', verifyJWT, getNews);
app.post('/api/news', verifyJWT, requireRole('Admin'), createNews);

// Announcements Routes
app.get('/api/announcements/active', verifyJWT, getActiveAnnouncements);
app.post('/api/announcements', verifyJWT, requireRole('Admin'), createAnnouncement);
app.post('/api/announcements/:id/acknowledge', verifyJWT, acknowledgeAnnouncement);

// Services Routes
app.get('/api/services/status', verifyJWT, getServices);
app.patch('/api/services/:id/status', verifyJWT, requireRole('IT Ops'), updateServiceStatus);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      correlationId: req.headers['x-correlation-id'] || 'unknown'
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;