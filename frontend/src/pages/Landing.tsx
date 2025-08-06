import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustedVendors } from '@/components/TrustedVendors';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export const Landing: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup' | 'provider-signup';
  }>({
    isOpen: false,
    mode: 'signin'
  });
  
  const [, setSelectedEventType] = useState<string>('Wedding');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect signed-in users to their dashboard
  useEffect(() => {
    console.log('REDIRECT CHECK:', { 
      loading, 
      hasUser: !!user, 
      hasProfile: !!userProfile,
      userType: userProfile?.type,
      isRedirecting 
    });
    
    if (!loading && user && !isRedirecting) {
      console.log('User signed in, determining redirect...');
      setIsRedirecting(true);
      
      // Wait a bit for profile to load, then redirect based on user type
      setTimeout(() => {
        const userType = userProfile?.type || 'user';
        const redirectPath = userType === 'provider' 
          ? '/evt-mngment/provider-dashboard' 
          : '/evt-mngment/dashboard';
        
        console.log(`Redirecting ${userType} to: ${redirectPath}`);
        window.location.href = redirectPath;
      }, 1000); // Longer delay to allow profile loading
    }
  }, [user, userProfile, loading, isRedirecting]);

  const handleAuthModalOpen = (mode: 'signin' | 'signup' | 'provider-signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthModalClose = () => {
    setAuthModal({ isOpen: false, mode: 'signin' });
  };

  const handleEventSelect = (eventType: string) => {
    setSelectedEventType(eventType);
  };

  // Show loading screen while redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onAuthModalOpen={handleAuthModalOpen} />
      <Hero onAuthModalOpen={handleAuthModalOpen} onEventSelect={handleEventSelect} />
      <HowItWorks />
      <TrustedVendors />
      <Footer />
      
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={handleAuthModalClose}
        onModeChange={(mode) => setAuthModal({ isOpen: true, mode })}
      />
    </div>
  );
};