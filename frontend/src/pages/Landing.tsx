import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustedVendors } from '@/components/TrustedVendors';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export const Landing: React.FC = () => {
  const { user, session, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup' | 'provider-signup';
  }>({
    isOpen: false,
    mode: 'signin'
  });
  
  const [, setSelectedEventType] = useState<string>('Wedding');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Debug OAuth callback
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    
    let debug = `Debug Info:\n`;
    debug += `- Has access_token in URL: ${!!accessToken}\n`;
    debug += `- Has refresh_token in URL: ${!!refreshToken}\n`;
    debug += `- User: ${user?.email || 'None'}\n`;
    debug += `- Session: ${!!session}\n`;
    debug += `- Loading: ${loading}\n`;
    debug += `- URL hash: ${window.location.hash}\n`;
    
    // Check localStorage
    const supabaseData = localStorage.getItem('supabase.auth.token');
    debug += `- localStorage has supabase token: ${!!supabaseData}\n`;
    
    setDebugInfo(debug);
    console.log(debug);
  }, [user, session, loading]);

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