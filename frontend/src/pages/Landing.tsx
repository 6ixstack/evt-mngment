import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustedVendors } from '@/components/TrustedVendors';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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

  // Handle OAuth callback and redirect signed-in users
  useEffect(() => {
    const handleRedirect = async () => {
      if (loading || isRedirecting) return;
      
      if (user) {
        setIsRedirecting(true);
        
        // Check if this is an OAuth callback
        const oauthUserType = sessionStorage.getItem('oauth_user_type');
        
        if (oauthUserType) {
          // OAuth user - create profile if needed
          console.log('OAuth callback detected, user type:', oauthUserType);
          
          // Try to create user profile
          const { error } = await supabase
            .from('users')
            .insert({
              id: user.id,
              name: user.user_metadata?.full_name || user.email,
              email: user.email!,
              type: oauthUserType
            });
          
          // Ignore duplicate errors
          if (error && error.code !== '23505') {
            console.error('Profile creation error:', error);
          }
          
          sessionStorage.removeItem('oauth_user_type');
          
          // Redirect based on OAuth user type
          if (oauthUserType === 'provider') {
            window.location.href = '/evt-mngment/provider-dashboard';
          } else {
            window.location.href = '/evt-mngment/dashboard';
          }
        } else {
          // Regular signed-in user - check their profile
          const { data: profile } = await supabase
            .from('users')
            .select('type')
            .eq('id', user.id)
            .single();
          
          if (profile?.type === 'provider') {
            window.location.href = '/evt-mngment/provider-dashboard';
          } else {
            window.location.href = '/evt-mngment/dashboard';
          }
        }
      }
    };
    
    handleRedirect();
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