import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface DashboardWrapperProps {
  children: React.ReactNode;
  requiredUserType?: 'user' | 'provider';
}

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ 
  children 
}) => {
  const { user, loading } = useAuth();

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="space-y-4">
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
          <p className="mt-6 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please sign in
          </h2>
          <p className="text-gray-600">
            You need to be signed in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Let dashboards handle their own specific logic
  return <>{children}</>;
};