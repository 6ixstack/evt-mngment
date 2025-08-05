import React from 'react';
import { Button } from '@/components/ui/button';
import { EventTypeSelector } from '@/components/EventTypeSelector';
import { motion } from 'framer-motion';
import { SparklesIcon, HeartIcon, StarIcon } from '@heroicons/react/24/solid';

interface HeroProps {
  onAuthModalOpen?: (mode: 'signin' | 'signup' | 'provider-signup') => void;
  onEventSelect?: (eventType: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onAuthModalOpen, onEventSelect }) => {
  return (
    <div className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-pink-200">
          <HeartIcon className="h-16 w-16 opacity-20" />
        </div>
        <div className="absolute top-40 right-20 text-purple-200">
          <SparklesIcon className="h-12 w-12 opacity-30" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-pink-300">
          <StarIcon className="h-8 w-8 opacity-25" />
        </div>
        <div className="absolute top-1/3 right-1/3 text-purple-300">
          <HeartIcon className="h-6 w-6 opacity-20" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              <span className="block">Dream.</span>
              <span className="block text-primary-600">Plan.</span>
              <span className="block">Celebrate.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto"
          >
            From vision to venue in minutes. Let AI create your perfect event plan 
            and connect you with trusted local vendors.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10"
          >
            <EventTypeSelector 
              onEventSelect={(eventType) => {
                onEventSelect?.(eventType);
                onAuthModalOpen?.('signup');
              }} 
            />
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 h-auto"
                onClick={() => onAuthModalOpen?.('signin')}
              >
                Sign In
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-lg px-8 py-3 h-auto text-primary-600 hover:text-primary-700"
                onClick={() => onAuthModalOpen?.('provider-signup')}
              >
                Join as Provider
              </Button>
            </div>
          </motion.div>

          {/* Hero Image/Animation Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 relative"
          >
            <div className="mx-auto max-w-4xl">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <SparklesIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Describe Your Dream</h3>
                    <p className="text-gray-600 text-sm">Tell us about your perfect celebration</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <HeartIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get Your Plan</h3>
                    <p className="text-gray-600 text-sm">AI creates your personalized checklist</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <StarIcon className="h-8 w-8 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Connect & Celebrate</h3>
                    <p className="text-gray-600 text-sm">Find trusted vendors and make it happen</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <p className="text-gray-500 text-sm mb-8">Trusted by couples across Canada</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-gray-400 font-semibold">Toronto</div>
              <div className="text-gray-400 font-semibold">Vancouver</div>
              <div className="text-gray-400 font-semibold">Calgary</div>
              <div className="text-gray-400 font-semibold">Montreal</div>
              <div className="text-gray-400 font-semibold">Ottawa</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};