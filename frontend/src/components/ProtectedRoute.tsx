import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'user' | 'provider';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { user, userProfile, loading } = useAuth();

  console.log('ProtectedRoute check:', {
    loading,
    hasUser: !!user,
    userEmail: user?.email,
    hasUserProfile: !!userProfile,
    userProfileType: userProfile?.type,
    requiredUserType,
    currentPath: window.location.pathname
  });

  if (loading) {
    console.log('ProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to /');
    return <Navigate to="/" replace />;
  }

  if (requiredUserType && userProfile?.type !== requiredUserType) {
    console.log(`ProtectedRoute: User type mismatch. Required: ${requiredUserType}, Got: ${userProfile?.type}`);
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};