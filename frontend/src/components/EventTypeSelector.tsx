import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface EventTypeSelectorProps {
  onEventSelect: (eventType: string) => void;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ onEventSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('Wedding');

  const eventTypes = [
    { 
      value: 'Wedding', 
      label: 'Wedding', 
      description: 'Plan your perfect wedding celebration',
      emoji: '💍'
    },
    { 
      value: 'Birthday', 
      label: 'Birthday Party', 
      description: 'Celebrate another year of life',
      emoji: '🎂'
    },
    { 
      value: 'Corporate', 
      label: 'Corporate Event', 
      description: 'Professional gatherings and conferences',
      emoji: '🏢'
    },
    { 
      value: 'Anniversary', 
      label: 'Anniversary', 
      description: 'Milestone celebrations and renewals',
      emoji: '💕'
    },
    { 
      value: 'Graduation', 
      label: 'Graduation', 
      description: 'Academic achievement celebrations',
      emoji: '🎓'
    },
    { 
      value: 'Baby Shower', 
      label: 'Baby Shower', 
      description: 'Welcome the new arrival',
      emoji: '👶'
    },
    { 
      value: 'Engagement', 
      label: 'Engagement Party', 
      description: 'Celebrate your commitment',
      emoji: '💎'
    },
    { 
      value: 'Reunion', 
      label: 'Family Reunion', 
      description: 'Bring the family together',
      emoji: '👨‍👩‍👧‍👦'
    }
  ];

  const handleEventSelect = (eventType: string) => {
    setSelectedEvent(eventType);
    setIsOpen(false);
    onEventSelect(eventType);
  };

  const selectedEventData = eventTypes.find(e => e.value === selectedEvent);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
      <div className="text-lg font-medium text-gray-700 whitespace-nowrap">
        I want to plan a
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 text-left min-w-[200px] hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        >
          <span className="text-lg">{selectedEventData?.emoji}</span>
          <span className="font-medium text-gray-900 flex-1">{selectedEventData?.label}</span>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {eventTypes.map((eventType) => (
                <button
                  key={eventType.value}
                  onClick={() => handleEventSelect(eventType.value)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                    selectedEvent === eventType.value ? 'bg-primary-50 text-primary-700' : ''
                  }`}
                >
                  <span className="text-lg">{eventType.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-900">{eventType.label}</div>
                    <div className="text-sm text-gray-500">{eventType.description}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      <Button
        size="lg"
        className="text-lg px-8 py-4 h-auto whitespace-nowrap"
        onClick={() => onEventSelect(selectedEvent)}
      >
        <SparklesIcon className="h-5 w-5 mr-2" />
        Get Started
      </Button>
    </div>
  );
};