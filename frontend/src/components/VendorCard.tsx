import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactVendorModal } from '@/components/ContactVendorModal';
import { 
  MapPinIcon,
  TagIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface Provider {
  id: string;
  business_name: string;
  provider_type: string;
  location_city: string;
  location_province: string;
  tags: string[];
  logo_url?: string;
  description: string;
}

interface VendorCardProps {
  provider: Provider;
  stepId: string;
}

export const VendorCard: React.FC<VendorCardProps> = ({ provider, stepId }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatProviderType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <>
      <Card className="w-72 h-full hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Logo or Initials */}
            <div className="flex-shrink-0">
              {provider.logo_url ? (
                <img
                  src={provider.logo_url}
                  alt={`${provider.business_name} logo`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  {getInitials(provider.business_name)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">
                {provider.business_name}
              </h4>
              <p className="text-sm text-gray-500">
                {formatProviderType(provider.provider_type)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {provider.location_city}, {provider.location_province}
            </span>
          </div>

          {/* Tags */}
          {provider.tags && provider.tags.length > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <TagIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {provider.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {provider.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{provider.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {truncateDescription(provider.description)}
          </p>

          {/* Contact Button */}
          <Button
            onClick={() => setIsContactModalOpen(true)}
            className="w-full"
            size="sm"
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </CardContent>
      </Card>

      <ContactVendorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        provider={provider}
        stepId={stepId}
      />
    </>
  );
};