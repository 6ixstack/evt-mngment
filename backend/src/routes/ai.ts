import express from 'express';
import { AIController } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const aiController = new AIController();

router.post('/generate-plan', authMiddleware, aiController.generatePlan);
router.post('/refine-step', authMiddleware, aiController.refineStep);

export default router;