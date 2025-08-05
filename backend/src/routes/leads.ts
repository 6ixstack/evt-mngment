import express from 'express';
import { LeadsController } from '../controllers/leadsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const leadsController = new LeadsController();

router.post('/', authMiddleware, leadsController.createLead);
router.get('/', authMiddleware, leadsController.getLeads);
router.get('/stats', authMiddleware, leadsController.getLeadStats);
router.put('/:id', authMiddleware, leadsController.updateLead);
router.delete('/:id', authMiddleware, leadsController.deleteLead);

export default router;