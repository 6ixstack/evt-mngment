import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="animate-pulse"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          {/* Step number skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          
          <div className="flex-1 space-y-3">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Vendors section skeleton */}
            <div className="pt-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="flex gap-4">
                {/* Vendor card skeletons */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-72 flex-shrink-0">
                    <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};