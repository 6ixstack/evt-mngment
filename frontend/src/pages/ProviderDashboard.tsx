import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileTab } from '@/components/provider/ProfileTab';
import { LeadsTab } from '@/components/provider/LeadsTab';
import { SubscriptionTab } from '@/components/provider/SubscriptionTab';
import { AnalyticsTab } from '@/components/provider/AnalyticsTab';
import { 
  UserIcon,
  EnvelopeIcon,
  CreditCardIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export const ProviderDashboard: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.provider) {
      setProvider(userProfile.provider);
      setLoading(false);
    }
  }, [userProfile]);

  const getProfileCompleteness = () => {
    if (!provider) return 0;
    
    const fields = [
      provider.business_name,
      provider.provider_type,
      provider.phone,
      provider.location_city,
      provider.location_province,
      provider.description,
      provider.tags?.length > 0,
      provider.logo_url,
      provider.sample_images?.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const isSubscriptionActive = provider?.subscription_status === 'active';
  const completeness = getProfileCompleteness();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {provider?.business_name || user?.user_metadata?.name}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your business profile and leads</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sign Out Button */}
              <Button
                variant="outline"
                onClick={signOut}
              >
                <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              
              {/* Profile Completeness */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-gray-200 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700">{completeness}%</span>
                    </div>
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-primary-600 border-r-transparent border-b-transparent"
                      style={{ 
                        transform: `rotate(${(completeness / 100) * 360}deg)`,
                        transformOrigin: 'center'
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Profile Complete</p>
                    <p className="text-sm text-gray-600">Keep improving visibility</p>
                  </div>
                </div>
              </Card>

              {/* Subscription Status */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  {isSubscriptionActive ? (
                    <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {isSubscriptionActive ? 'Active' : 'Inactive'}
                    </p>
                    <p className="text-sm text-gray-600">Subscription Status</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Subscription Warning */}
        {!isSubscriptionActive && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">Subscription Required</h3>
                  <p className="text-yellow-700 mt-1">
                    Your profile is not visible to customers. Activate your subscription to start receiving leads.
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab('subscription')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Activate Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab provider={provider} onUpdate={setProvider} />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTab providerId={provider?.id} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionTab provider={provider} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab providerId={provider?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};