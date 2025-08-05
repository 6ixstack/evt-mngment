import express from 'express';
import { ProvidersController } from '../controllers/providersController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const providersController = new ProvidersController();

router.get('/', providersController.getProviders);
router.get('/:id', providersController.getProvider);
router.post('/', authMiddleware, providersController.createProvider);
router.put('/:id', authMiddleware, providersController.updateProvider);
router.delete('/:id', authMiddleware, providersController.deleteProvider);

export default router;