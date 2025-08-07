import express from 'express';
import { StripeController } from '../controllers/stripeController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const stripeController = new StripeController();

// Bind methods to preserve 'this' context
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook.bind(stripeController));
router.post('/create-subscription', authMiddleware, stripeController.createCheckoutSession.bind(stripeController));
router.post('/customer-portal', authMiddleware, stripeController.createCustomerPortal.bind(stripeController));
router.post('/cancel-subscription', authMiddleware, stripeController.cancelSubscription.bind(stripeController));
router.get('/subscription-status', authMiddleware, stripeController.getSubscriptionStatus.bind(stripeController));

export default router;