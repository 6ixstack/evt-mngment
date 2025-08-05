import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SparklesIcon } from '@heroicons/react/24/outline';
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

interface Step {
  id: string;
  step_title: string;
  description: string;
  order_number: number;
  tags: string[];
  matching_providers: Provider[];
}

interface RefineStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: Step;
  onRefineComplete: (updatedProviders: Provider[]) => void;
}

export const RefineStepModal: React.FC<RefineStepModalProps> = ({
  isOpen,
  onClose,
  step,
  onRefineComplete
}) => {
  const { user } = useAuth();
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const placeholderTexts = [
    "Only show venues that allow outside food and are under $10,000",
    "I need caterers that serve halal food and can accommodate 200+ guests",
    "Looking for photographers with experience in outdoor weddings",
    "Need decorators who specialize in traditional South Asian themes",
    "Find musicians who can play both Western and Bollywood music"
  ];

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) {
      toast.error('Please describe what you want for this step');
      return;
    }

    setIsRefining(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/refine-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          step_id: step.id,
          refinement_prompt: refinementPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refine step');
      }

      onRefineComplete(data.matching_providers || []);
      toast.success('Step refined successfully!');
      onClose();

    } catch (error: any) {
      console.error('Step refinement error:', error);
      toast.error(error.message || 'Failed to refine step. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleClose = () => {
    if (!isRefining) {
      setRefinementPrompt('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Refine: {step.step_title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Describe what specific requirements you have for this step to get better vendor matches.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you looking for specifically?
            </label>
            <textarea
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              placeholder={placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)]}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              disabled={isRefining}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-1">
              <strong>Current step:</strong> {step.description}
            </p>
            <p className="text-sm text-gray-500">
              Found {step.matching_providers?.length || 0} matching vendors
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isRefining}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefine}
            disabled={!refinementPrompt.trim() || isRefining}
            className="flex-1"
          >
            {isRefining ? (
              <>
                <SparklesIcon className="h-4 w-4 mr-2 animate-pulse" />
                Refining...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Refine Step
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};