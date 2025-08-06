import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

type ProviderOnboardingFormData = {
  business_name: string;
  provider_type: string;
  phone: string;
  location_city: string;
  location_province: string;
  description: string;
  tags: string;
};

interface ProviderOnboardingProps {
  onComplete: () => void;
}

export const ProviderOnboarding: React.FC<ProviderOnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ProviderOnboardingFormData>();

  const providerTypes = [
    { value: 'venue', label: 'Venue' },
    { value: 'catering', label: 'Catering' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'florist', label: 'Florist' },
    { value: 'decorator', label: 'Decorator' },
    { value: 'music', label: 'Music/DJ' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'makeup', label: 'Makeup Artist' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'invitations', label: 'Invitations' },
    { value: 'other', label: 'Other' }
  ];

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  const onSubmit = async (data: ProviderOnboardingFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const providerData = {
        user_id: user.id,
        business_name: data.business_name,
        provider_type: data.provider_type,
        phone: data.phone,
        location_city: data.location_city,
        location_province: data.location_province,
        location_lat: null, // Will be set later via geocoding
        location_lng: null, // Will be set later via geocoding
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      console.log('Creating provider profile:', providerData);
      
      const { error } = await supabase
        .from('providers')
        .insert(providerData);

      if (error) {
        console.error('Provider profile creation error:', error);
        toast.error('Failed to create provider profile: ' + error.message);
        return;
      }

      toast.success('Provider profile created successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Provider onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Provider Profile</CardTitle>
          <p className="text-gray-600 text-center">
            Tell us about your business to start receiving leads from customers.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <Input
                  type="text"
                  placeholder="Your business name"
                  {...form.register('business_name', { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...form.register('provider_type', { required: true })}
                >
                  <option value="">Select service type</option>
                  {providerTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                type="tel"
                placeholder="Your phone number"
                {...form.register('phone', { required: true })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  type="text"
                  placeholder="Your city"
                  {...form.register('location_city', { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...form.register('location_province', { required: true })}
                >
                  <option value="">Select province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                placeholder="Describe your services and what makes your business special..."
                {...form.register('description', { required: true, maxLength: 1000 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., halal, luxury, outdoor, budget-friendly"
                {...form.register('tags')}
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};