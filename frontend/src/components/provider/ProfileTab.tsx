import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ImageUpload';
import { TagInput } from '@/components/TagInput';
import { 
  PencilIcon,
  PhotoIcon,
  MapPinIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProfileTabProps {
  provider: any;
  onUpdate: (provider: any) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ provider, onUpdate }) => {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      business_name: provider?.business_name || '',
      provider_type: provider?.provider_type || '',
      phone: provider?.phone || '',
      location_city: provider?.location_city || '',
      location_province: provider?.location_province || '',
      description: provider?.description || '',
      tags: provider?.tags || [],
      logo_url: provider?.logo_url || '',
      sample_images: provider?.sample_images || []
    }
  });

  const providerTypes = [
    'venue', 'catering', 'photographer', 'videographer', 'florist',
    'decorator', 'music', 'transportation', 'makeup', 'clothing',
    'jewelry', 'invitations', 'other'
  ];

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/providers/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProvider = await response.json();
      onUpdate(updatedProvider);
      setIsEditing(false);
      toast.success('Profile updated successfully!');

    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    Object.keys(provider).forEach(key => {
      setValue(key as any, provider[key]);
    });
  };

  const handleLogoUpload = (url: string) => {
    setValue('logo_url', url);
  };

  const handleImagesUpload = (urls: string[]) => {
    setValue('sample_images', urls);
  };

  const handleTagsChange = (tags: string[]) => {
    setValue('tags', tags);
  };

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Information</CardTitle>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmit(handleSave)}
                  disabled={isSubmitting}
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <Input
                  {...register('business_name', { required: 'Business name is required' })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {errors.business_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  {...register('provider_type', { required: 'Service type is required' })}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select service type</option>
                  {providerTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.provider_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.provider_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  {...register('phone', { required: 'Phone number is required' })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  {...register('location_province', { required: 'Province is required' })}
                  disabled={!isEditing}
                  className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select province</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.location_province && (
                  <p className="text-red-500 text-sm mt-1">{errors.location_province.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <Input
                  {...register('location_city', { required: 'City is required' })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
                {errors.location_city && (
                  <p className="text-red-500 text-sm mt-1">{errors.location_city.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                })}
                disabled={!isEditing}
                className={`input min-h-[120px] resize-none ${!isEditing ? 'bg-gray-50' : ''}`}
                placeholder="Describe your services, specialties, and what makes your business unique..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {watch('description')?.length || 0}/1000 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TagIcon className="h-4 w-4 inline mr-1" />
                Service Tags
              </label>
              <TagInput
                value={watch('tags') || []}
                onChange={handleTagsChange}
                disabled={!isEditing}
                placeholder="Add tags like 'halal', 'luxury', 'outdoor', etc."
              />
              <p className="text-sm text-gray-500 mt-1">
                Add relevant tags to help customers find your services
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhotoIcon className="h-5 w-5" />
            Business Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <ImageUpload
              value={watch('logo_url')}
              onChange={handleLogoUpload}
              disabled={!isEditing}
              aspectRatio="1:1"
              maxSize={5}
              folder="provider-logos"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a square logo (recommended: 300x300px, max 5MB)
            </p>
          </div>

          {/* Sample Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Images
            </label>
            <ImageUpload
              value={watch('sample_images')}
              onChange={handleImagesUpload}
              disabled={!isEditing}
              multiple
              maxFiles={10}
              maxSize={10}
              folder="provider-images"
            />
            <p className="text-sm text-gray-500 mt-1">
              Showcase your work with up to 10 images (max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};