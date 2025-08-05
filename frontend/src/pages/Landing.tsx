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

  // Redirect signed-in users to their dashboard
  useEffect(() => {
    if (!loading && user && userProfile) {
      console.log('User already signed in, redirecting to dashboard...');
      const userType = userProfile.type || 'user';
      const redirectPath = userType === 'provider' ? '/evt-mngment/provider-dashboard' : '/evt-mngment/dashboard';
      
      // Small delay to prevent flash of landing page
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    }
  }, [user, userProfile, loading]);

  const handleAuthModalOpen = (mode: 'signin' | 'signup' | 'provider-signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthModalClose = () => {
    setAuthModal({ isOpen: false, mode: 'signin' });
  };

  const handleEventSelect = (eventType: string) => {
    setSelectedEventType(eventType);
  };

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