import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import toast from 'react-hot-toast';

interface DashboardWrapperProps {
  children: React.ReactNode;
  requiredUserType?: 'user' | 'provider';
}

export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { user, userProfile, loading, createUserProfile } = useAuth();
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);

  useEffect(() => {
    const setupOAuthProfile = async () => {
      if (!user || loading || userProfile || isSettingUpProfile) return;

      // Check if this is an OAuth user without a profile
      const oauthUserType = sessionStorage.getItem('oauth_user_type');
      if (oauthUserType && requiredUserType && oauthUserType === requiredUserType) {
        console.log('Setting up OAuth profile for', oauthUserType, 'user');
        setIsSettingUpProfile(true);
        
        try {
          await createUserProfile(user, oauthUserType);
          toast.success('Welcome! Profile created successfully.');
        } catch (error: any) {
          console.error('Failed to create OAuth profile:', error);
          // Don't show error toast - might be a duplicate which is fine
        } finally {
          // Always clear the stored user type after attempting to use it
          sessionStorage.removeItem('oauth_user_type');
          setIsSettingUpProfile(false);
        }
      }
    };

    setupOAuthProfile();
  }, [user, userProfile, loading, requiredUserType, createUserProfile, isSettingUpProfile]);

  // Show loading while auth is loading or we're setting up profile
  if (loading || isSettingUpProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="space-y-4">
            <LoadingSkeleton />
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
          <p className="mt-6 text-gray-600">
            {isSettingUpProfile ? 'Setting up your profile...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect will happen from AuthContext
  if (!user) {
    return null;
  }

  // Let individual dashboards handle their own logic
  // This wrapper just handles OAuth profile creation

  return <>{children}</>;
};