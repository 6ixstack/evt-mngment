import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustedVendors } from '@/components/TrustedVendors';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const Landing: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup' | 'provider-signup';
  }>({
    isOpen: false,
    mode: 'signin'
  });

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if this is an OAuth callback
      const oauthUserType = sessionStorage.getItem('oauth_user_type');
      
      if (user && oauthUserType) {
        console.log('OAuth callback detected, setting user type:', oauthUserType);
        
        // Call RPC function to set user type
        const { error } = await supabase.rpc('set_user_type', {
          user_id: user.id,
          new_user_type: oauthUserType
        });
        
        if (error) {
          console.error('Error setting user type:', error);
        }
        
        // Clear stored type
        sessionStorage.removeItem('oauth_user_type');
      }
    };

    if (user && !loading) {
      handleOAuthCallback();
    }
  }, [user, loading]);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user && userProfile) {
      const redirectPath = userProfile.type === 'provider' 
        ? '/provider-dashboard' 
        : '/dashboard';
      navigate(redirectPath);
    }
  }, [user, userProfile, loading, navigate]);

  const handleAuthModalOpen = (mode: 'signin' | 'signup' | 'provider-signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleAuthModalClose = () => {
    setAuthModal({ isOpen: false, mode: 'signin' });
  };

  const handleEventSelect = (eventType: string) => {
    // Handle event selection
    console.log('Event selected:', eventType);
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