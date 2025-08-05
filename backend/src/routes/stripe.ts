import express from 'express';
import { StripeController } from '../controllers/stripeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const stripeController = new StripeController();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);
router.post('/create-subscription', authMiddleware, stripeController.createCheckoutSession);
router.post('/customer-portal', authMiddleware, stripeController.createCustomerPortal);
router.post('/cancel-subscription', authMiddleware, stripeController.cancelSubscription);
router.get('/subscription-status', authMiddleware, stripeController.getSubscriptionStatus);

export default router;