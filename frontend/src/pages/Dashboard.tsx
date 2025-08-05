import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventTypeSelector } from '@/components/EventTypeSelector';
import { StepCard } from '@/components/StepCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { 
  SparklesIcon, 
  ShareIcon, 
  BookmarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Step {
  id: string;
  step_title: string;
  description: string;
  order_number: number;
  tags: string[];
  matching_providers: Provider[];
}

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

interface Event {
  id: string;
  event_type: string;
  prompt: string;
  created_at: string;
  checklist_json: any;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'select' | 'describe' | 'generating' | 'plan'>('select');
  const [selectedEventType, setSelectedEventType] = useState<string>('Wedding');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<Step[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const placeholderTexts = {
    Wedding: "A 3-day wedding with 200 guests, halal food, in Toronto in July. We want elegant decorations and professional photography.",
    Birthday: "A surprise 30th birthday party for 50 friends, outdoor BBQ theme, in Vancouver this summer.",
    Corporate: "Annual company retreat for 100 employees, team building activities, professional catering, in Calgary.",
    Anniversary: "25th wedding anniversary celebration for 75 family members, elegant dinner, in Montreal.",
    Graduation: "Graduation party for 40 guests, casual outdoor setting, in Ottawa this spring.",
    'Baby Shower': "Baby shower for 30 guests, gender-neutral theme, afternoon tea style, in Toronto.",
    Engagement: "Engagement party for 60 guests, cocktail style reception, in Vancouver.",
    Reunion: "Family reunion for 80 relatives, weekend camping trip, in Alberta."
  };

  const handleEventSelect = (eventType: string) => {
    setSelectedEventType(eventType);
    setCurrentStep('describe');
  };

  const handleGeneratePlan = async () => {
    if (!eventDescription.trim()) {
      toast.error('Please describe your event first');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generating');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          event_type: selectedEventType,
          prompt: eventDescription
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setCurrentEvent(data.event);
      setGeneratedPlan(data.checklist || []);
      setCurrentStep('plan');
      toast.success('Your personalized plan is ready!');

    } catch (error: any) {
      console.error('Plan generation error:', error);
      toast.error(error.message || 'Failed to generate plan. Please try again.');
      setCurrentStep('describe');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!currentEvent) return;

    try {
      toast.success('Plan saved successfully!');
    } catch (error) {
      toast.error('Failed to save plan');
    }
  };

  const handleSharePlan = () => {
    if (!currentEvent) return;

    const shareUrl = `${window.location.origin}/plan/${currentEvent.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `My ${selectedEventType} Plan`,
        text: `Check out my ${selectedEventType.toLowerCase()} plan!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Plan link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.name || 'there'}! 
          </h1>
          <p className="text-gray-600">Let's plan your perfect event</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Event Type Selection */}
          {currentStep === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">What are you planning?</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <EventTypeSelector onEventSelect={handleEventSelect} />
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Event Description */}
          {currentStep === 'describe' && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Describe your dream {selectedEventType.toLowerCase()}
                  </CardTitle>
                  <p className="text-gray-600">
                    Tell us about your vision - the more details, the better your personalized plan!
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <textarea
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder={placeholderTexts[selectedEventType as keyof typeof placeholderTexts]}
                        className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('select')}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleGeneratePlan}
                        disabled={!eventDescription.trim()}
                        className="px-8"
                      >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Generate My Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Loading State */}
          {currentStep === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <SparklesIcon className="h-8 w-8 text-primary-600 animate-pulse" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Assembling your dream team...
                  </h2>
                  <p className="text-gray-600">
                    Our AI is creating a personalized plan just for you
                  </p>
                </div>
                
                <div className="space-y-4">
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                  <LoadingSkeleton />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Generated Plan */}
          {currentStep === 'plan' && generatedPlan.length > 0 && (
            <motion.div
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Here's your personalized {selectedEventType.toLowerCase()} plan
                </h2>
                <p className="text-gray-600">
                  Your AI-generated checklist with matching vendors for each step
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {generatedPlan.map((step, index) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    stepNumber={index + 1}
                    delay={index * 0.1}
                  />
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={handleSavePlan}
                >
                  <BookmarkIcon className="h-5 w-5 mr-2" />
                  Save My Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSharePlan}
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Share
                </Button>
                <Button onClick={() => {
                  setCurrentStep('select');
                  setEventDescription('');
                  setGeneratedPlan([]);
                  setCurrentEvent(null);
                }}>
                  Plan Another Event
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};