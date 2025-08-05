import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface SubscriptionTabProps {
  provider: any;
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ provider }) => {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stripe/subscription-status`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Fetch subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async () => {
    setCreating(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stripe/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          provider_id: provider.id,
          success_url: `${window.location.origin}/provider-dashboard?tab=subscription&success=true`,
          cancel_url: `${window.location.origin}/provider-dashboard?tab=subscription&cancelled=true`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error: any) {
      console.error('Create subscription error:', error);
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setCreating(false);
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? Your profile will become inactive.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stripe/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      fetchSubscriptionDetails();
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const manageSubscription = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stripe/customer-portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access customer portal');
      }

      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Customer portal error:', error);
      toast.error(error.message || 'Failed to access customer portal');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Active
          </Badge>
        );
      case 'past_due':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            Past Due
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Inactive
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              Subscription Status
            </CardTitle>
            {getStatusBadge(provider?.subscription_status || 'inactive')}
          </div>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
                  <p className="text-2xl font-bold text-primary-600">Provider Plan</p>
                  <p className="text-gray-600">$29/month</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Payment</h4>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {subscription.current_period_end 
                        ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
                  <p className="text-gray-700">
                    •••• •••• •••• {subscription.payment_method?.last4 || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {subscription.payment_method?.brand?.toUpperCase() || 'Card'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={manageSubscription} variant="outline">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Manage via Stripe
                </Button>
                {subscription.status === 'active' && (
                  <Button onClick={cancelSubscription} variant="destructive">
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Subscribe to activate your profile and start receiving leads from customers looking for your services.
              </p>
              <Button 
                onClick={createSubscription} 
                size="lg"
                disabled={creating}
              >
                {creating ? 'Processing...' : 'Subscribe Now - $29/month'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Plan Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Profile visible to all customers',
              'Unlimited leads and inquiries',
              'Business logo and portfolio images',
              'Direct customer contact information',
              'Lead management dashboard',
              'Performance analytics',
              'Priority customer support',
              'Cancel anytime'
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Billing history is managed through Stripe.</p>
              <Button 
                variant="outline" 
                onClick={manageSubscription}
                className="mt-4"
              >
                View in Stripe Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};