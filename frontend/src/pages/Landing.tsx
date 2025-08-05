import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustedVendors } from '@/components/TrustedVendors';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export const Landing: React.FC = () => {
  const { user, loading } = useAuth();
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
    console.log('REDIRECT CHECK:', { loading, hasUser: !!user, isRedirecting });
    
    if (!loading && user && !isRedirecting) {
      console.log('User already signed in, redirecting to dashboard...');
      setIsRedirecting(true);
      
      // Default to user dashboard since we can't wait for profile
      const redirectPath = '/evt-mngment/dashboard';
      
      // Small delay to prevent flash of landing page
      setTimeout(() => {
        console.log('Executing redirect to:', redirectPath);
        window.location.href = redirectPath;
      }, 500);
    }
  }, [user, loading, isRedirecting]);

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