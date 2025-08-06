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
        console.log('OAuth callback detected, checking for existing profile:', oauthUserType);
        
        // First check if profile already exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!existingProfile) {
          // Use upsert to avoid duplicate key errors
          console.log('Creating/updating user profile...');
          
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                type: oauthUserType as 'user' | 'provider'
              }, {
                onConflict: 'id'
              });
            
            if (error) {
              console.error('Error upserting user profile:', error);
            } else {
              console.log('User profile created/updated successfully:', userData);
            }
          } catch (error) {
            console.error('User profile upsert failed:', error);
          }
        }
        
        // Clear stored type
        sessionStorage.removeItem('oauth_user_type');
        
        // Navigate to appropriate dashboard
        const redirectPath = (existingProfile?.type || oauthUserType) === 'provider' 
          ? '/provider-dashboard' 
          : '/dashboard';
        navigate(redirectPath);
      }
    };

    if (user && !loading && !userProfile) {
      handleOAuthCallback();
    }
  }, [user, loading, userProfile, navigate]);

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