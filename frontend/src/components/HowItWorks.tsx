import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Describe Your Vision",
      description: "Tell us about your dream event - the style, size, location, and any special requirements like dietary needs or cultural traditions.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: SparklesIcon,
      title: "Get Your AI Plan",
      description: "Our AI event planner creates a personalized step-by-step checklist tailored to your specific needs and preferences.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: UserGroupIcon,
      title: "Discover Vendors",
      description: "Browse curated local vendors that match each step of your plan. Filter by location, style, budget, and special requirements.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: CheckCircleIcon,
      title: "Plan & Celebrate",
      description: "Connect with vendors, manage your timeline, and bring your dream event to life with confidence.",
      color: "bg-green-100 text-green-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From dream to reality in four simple steps. Our AI-powered platform 
            makes event planning effortless and enjoyable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>
              
              {/* Connecting line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-0 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
              )}

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full pt-8">
                <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Example Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              See It In Action
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 italic">
                "A 3-day wedding celebration for 200 guests in Toronto this July. 
                We need halal catering, traditional decorations, and want both indoor and outdoor venues."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Your AI-Generated Plan:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Book a venue (3 venues found)
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Hire halal caterers (5 caterers found)
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Book photography (8 photographers found)
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Arrange decorations (4 decorators found)
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Matched Vendors:</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <SparklesIcon className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Elegant Venues Toronto</p>
                      <p className="text-gray-500">Luxury • Downtown • 200+ capacity</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Gourmet Halal Catering</p>
                      <p className="text-gray-500">Pakistani • Mediterranean • Halal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};