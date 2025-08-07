import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../utils/supabase';
import { AuthRequest } from '../middleware/auth';
import { SubscriptionStatus } from '../types';

export class StripeController {
  private stripe: Stripe | undefined;
  private webhookSecret: string;

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    console.log('Initializing Stripe with key:', stripeSecretKey ? 'Found' : 'Missing');

    if (!stripeSecretKey) {
      console.warn('STRIPE_SECRET_KEY environment variable is missing - Stripe disabled');
      return;
    }

    try {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-07-30.basil' // Keep original API version
      });
      
      console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.stripe = undefined;
      // Don't throw error to prevent service crash
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      const sig = req.headers['stripe-signature'];

      if (!sig) {
        console.error('Missing stripe-signature header');
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      if (!this.webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
        return res.status(500).json({ error: 'Webhook secret not configured' });
      }

      let event: Stripe.Event;

      try {
        event = this.stripe.webhooks.constructEvent(req.body, sig, this.webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).json({ error: 'Webhook signature verification failed' });
      }

      console.log('Received Stripe webhook event:', event.type);

      // Handle the event
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ error: 'Webhook handling failed' });
    }
  }

  async createCheckoutSession(req: AuthRequest, res: Response) {
    try {
      console.log('createCheckoutSession called, stripe instance:', !!this.stripe);
      
      if (!this.stripe) {
        return res.status(503).json({ error: 'Stripe is not initialized - payment processing unavailable' });
      }
      
      const { success_url, cancel_url } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (req.user.type !== 'provider') {
        return res.status(403).json({ error: 'Only providers can create subscriptions' });
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', req.user.id)
        .single();

      if (userError) {
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }

      let customerId = userData.stripe_customer_id;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: req.user.email,
          metadata: {
            user_id: req.user.id
          }
        });

        customerId = customer.id;

        // Update user with Stripe customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', req.user.id);
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Replace with actual price ID
            quantity: 1,
          },
        ],
        success_url: success_url || `${process.env.FRONTEND_URL}/provider-dashboard?tab=subscription&success=true`,
        cancel_url: cancel_url || `${process.env.FRONTEND_URL}/provider-dashboard?tab=subscription&cancelled=true`,
        metadata: {
          user_id: req.user.id,
        },
      });

      res.json({
        sessionId: session.id,
        url: session.url
      });

    } catch (error) {
      console.error('Create checkout session error:', error);
      if (error instanceof Stripe.errors.StripeError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }

  async createCustomerPortal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (req.user.type !== 'provider') {
        return res.status(403).json({ error: 'Only providers can access customer portal' });
      }

      // Get user's Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', req.user.id)
        .single();

      if (userError || !userData.stripe_customer_id) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Create customer portal session
      const session = await this.stripe.billingPortal.sessions.create({
        customer: userData.stripe_customer_id,
        return_url: `${process.env.FRONTEND_URL}/provider-dashboard?tab=subscription`,
      });

      res.json({
        url: session.url
      });

    } catch (error) {
      console.error('Create customer portal error:', error);
      if (error instanceof Stripe.errors.StripeError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create customer portal session' });
    }
  }

  async createSubscription(req: AuthRequest, res: Response) {
    try {
      const { price_id, payment_method_id } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (req.user.type !== 'provider') {
        return res.status(403).json({ error: 'Only providers can create subscriptions' });
      }

      // Get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', req.user.id)
        .single();

      if (userError) {
        return res.status(500).json({ error: 'Failed to fetch user data' });
      }

      let customerId = userData.stripe_customer_id;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: req.user.email,
          metadata: {
            user_id: req.user.id
          }
        });

        customerId = customer.id;

        // Update user with Stripe customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', req.user.id);
      }

      // Attach payment method to customer
      if (payment_method_id) {
        await this.stripe.paymentMethods.attach(payment_method_id, {
          customer: customerId,
        });

        // Set as default payment method
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: payment_method_id,
          },
        });
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price_id }],
        default_payment_method: payment_method_id,
        expand: ['latest_invoice.payment_intent'],
      });

      // Update provider subscription status
      await this.updateProviderSubscriptionStatus(req.user.id, subscription);

      res.json({
        subscription_id: subscription.id,
        client_secret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status,
        message: 'Subscription created successfully'
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      if (error instanceof Stripe.errors.StripeError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  }

  async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      const { subscription_id } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (req.user.type !== 'provider') {
        return res.status(403).json({ error: 'Only providers can cancel subscriptions' });
      }

      // Verify subscription belongs to user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', req.user.id)
        .single();

      if (userError || !userData.stripe_customer_id) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Get subscription to verify ownership
      const subscription = await this.stripe.subscriptions.retrieve(subscription_id);
      
      if (subscription.customer !== userData.stripe_customer_id) {
        return res.status(403).json({ error: 'Not authorized to cancel this subscription' });
      }

      // Cancel subscription at period end
      const canceledSubscription = await this.stripe.subscriptions.update(subscription_id, {
        cancel_at_period_end: true,
      });

      res.json({
        subscription_id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        current_period_end: (canceledSubscription as any).current_period_end,
        message: 'Subscription will be canceled at the end of the current period'
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      if (error instanceof Stripe.errors.StripeError) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  async getSubscriptionStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (req.user.type !== 'provider') {
        return res.status(403).json({ error: 'Only providers can check subscription status' });
      }

      // Get provider subscription status from database
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('subscription_status')
        .eq('user_id', req.user.id)
        .single();

      if (providerError) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }

      // Get user's Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', req.user.id)
        .single();

      if (userError || !userData.stripe_customer_id) {
        return res.json({
          subscription_status: providerData.subscription_status,
          has_active_subscription: false
        });
      }

      // Get active subscriptions from Stripe
      const subscriptions = await this.stripe.subscriptions.list({
        customer: userData.stripe_customer_id,
        status: 'active',
        limit: 1
      });

      const hasActiveSubscription = subscriptions.data.length > 0;

      res.json({
        subscription_status: providerData.subscription_status,
        has_active_subscription: hasActiveSubscription,
        subscription: hasActiveSubscription ? subscriptions.data[0] : null
      });
    } catch (error) {
      console.error('Get subscription status error:', error);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      const customerId = subscription.customer as string;
      await this.updateProviderStatusByCustomerId(customerId, 'active');
      console.log(`Subscription created for customer: ${customerId}`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      const customerId = subscription.customer as string;
      let status: SubscriptionStatus;

      switch (subscription.status) {
        case 'active':
          status = 'active';
          break;
        case 'past_due':
          status = 'past_due';
          break;
        case 'canceled':
        case 'unpaid':
          status = 'cancelled';
          break;
        default:
          status = 'inactive';
      }

      await this.updateProviderStatusByCustomerId(customerId, status);
      console.log(`Subscription updated for customer: ${customerId}, status: ${status}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      const customerId = subscription.customer as string;
      await this.updateProviderStatusByCustomerId(customerId, 'cancelled');
      console.log(`Subscription deleted for customer: ${customerId}`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      const customerId = invoice.customer as string;
      // If payment succeeded, ensure provider is active
      await this.updateProviderStatusByCustomerId(customerId, 'active');
      console.log(`Payment succeeded for customer: ${customerId}`);
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    try {
      const customerId = invoice.customer as string;
      // Mark as past due when payment fails
      await this.updateProviderStatusByCustomerId(customerId, 'past_due');
      console.log(`Payment failed for customer: ${customerId}`);
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  private async updateProviderStatusByCustomerId(customerId: string, status: SubscriptionStatus) {
    try {
      // Get user by Stripe customer ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (userError || !userData) {
        console.error('User not found for customer:', customerId);
        return;
      }

      // Update provider subscription status
      await supabase
        .from('providers')
        .update({
          subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.id);

      console.log(`Updated provider subscription status to ${status} for user: ${userData.id}`);
    } catch (error) {
      console.error('Error updating provider status:', error);
    }
  }

  private async updateProviderSubscriptionStatus(userId: string, subscription: Stripe.Subscription) {
    try {
      let status: SubscriptionStatus;

      switch (subscription.status) {
        case 'active':
          status = 'active';
          break;
        case 'past_due':
          status = 'past_due';
          break;
        case 'canceled':
        case 'unpaid':
          status = 'cancelled';
          break;
        default:
          status = 'inactive';
      }

      await supabase
        .from('providers')
        .update({
          subscription_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      console.log(`Updated provider subscription status to ${status} for user: ${userId}`);
    } catch (error) {
      console.error('Error updating provider subscription status:', error);
    }
  }
}