import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VendorCard } from '@/components/VendorCard';
import { RefineStepModal } from '@/components/RefineStepModal';
import { 
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  ChevronLeftIcon
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

interface Step {
  id: string;
  step_title: string;
  description: string;
  order_number: number;
  tags: string[];
  matching_providers: Provider[];
}

interface StepCardProps {
  step: Step;
  stepNumber: number;
  delay?: number;
}

export const StepCard: React.FC<StepCardProps> = ({ step, stepNumber, delay = 0 }) => {
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`vendors-${step.id}`);
    if (!container) return;

    const scrollAmount = 320; // Width of vendor card + gap
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;

    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);

    // Update scroll indicators
    setTimeout(() => {
      setCanScrollLeft(newPosition > 0);
      setCanScrollRight(newPosition < container.scrollWidth - container.clientWidth - 10);
    }, 300);
  };

  const handleRefineComplete = (updatedProviders: Provider[]) => {
    // In a real implementation, we would update the step's providers
    console.log('Updated providers:', updatedProviders);
    setIsRefineModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {stepNumber}
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    {step.step_title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRefineModalOpen(true)}
                className="flex-shrink-0"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Refine This Step
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {step.matching_providers && step.matching_providers.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Matching Vendors ({step.matching_providers.length})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScroll('left')}
                      disabled={!canScrollLeft}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleScroll('right')}
                      disabled={!canScrollRight}
                      className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div
                  id={`vendors-${step.id}`}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    setScrollPosition(target.scrollLeft);
                    setCanScrollLeft(target.scrollLeft > 0);
                    setCanScrollRight(target.scrollLeft < target.scrollWidth - target.clientWidth - 10);
                  }}
                >
                  {step.matching_providers.map((provider) => (
                    <div key={provider.id} className="flex-shrink-0">
                      <VendorCard 
                        provider={provider} 
                        stepId={step.id}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No vendors found for this step.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRefineModalOpen(true)}
                  className="mt-2"
                >
                  Refine Search Criteria
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <RefineStepModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        step={step}
        onRefineComplete={handleRefineComplete}
      />
    </>
  );
};