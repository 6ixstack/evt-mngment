import express from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Routes
router.get('/provider/:providerId', authMiddleware, analyticsController.getProviderAnalytics);
router.post('/view/:providerId', analyticsController.recordProviderView);

export default router;