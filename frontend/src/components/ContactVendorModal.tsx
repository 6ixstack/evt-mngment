import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  EnvelopeIcon,
  MapPinIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

interface ContactVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  stepId: string;
}

export const ContactVendorModal: React.FC<ContactVendorModalProps> = ({
  isOpen,
  onClose,
  provider,
  stepId
}) => {
  const { user, session } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultMessage = `Hi ${provider.business_name},

I'm planning an event and found your services through EventCraft. I'd love to learn more about your offerings and pricing.

Could you please share more details about your services and availability?

Thank you!
${user?.user_metadata?.name || 'Event Planner'}`;

  React.useEffect(() => {
    if (isOpen && !message) {
      setMessage(defaultMessage);
    }
  }, [isOpen, defaultMessage]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          provider_id: provider.id,
          step_id: stepId,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! The vendor will contact you soon.');
      onClose();
      setMessage('');

    } catch (error: any) {
      console.error('Contact vendor error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      onClose();
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Contact {provider.business_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vendor Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {provider.logo_url ? (
                <img
                  src={provider.logo_url}
                  alt={`${provider.business_name} logo`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-lg">
                  {getInitials(provider.business_name)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg">
                {provider.business_name}
              </h3>
              
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <UserIcon className="h-4 w-4" />
                <span>{formatProviderType(provider.provider_type)}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{provider.location_city}, {provider.location_province}</span>
              </div>

              {provider.tags && provider.tags.length > 0 && (
                <div className="flex items-start gap-1 mt-2">
                  <TagIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {provider.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white text-gray-600 text-xs rounded-full border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be sent directly to the vendor and they'll contact you through your provided email.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <EnvelopeIcon className="h-4 w-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};