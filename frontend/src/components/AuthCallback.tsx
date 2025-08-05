import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const { session, loading } = useAuth();

  useEffect(() => {
    // This component handles OAuth callbacks
    // The AuthContext will automatically process the callback and redirect
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-gray-600">Signed in successfully! Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">Authentication failed. Please try again.</p>
        <a 
          href="/evt-mngment/" 
          className="text-pink-600 hover:text-pink-700 underline mt-2 inline-block"
        >
          Return to home
        </a>
      </div>
    </div>
  );
};