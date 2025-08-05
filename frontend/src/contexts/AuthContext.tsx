import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (userType?: 'user' | 'provider') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle OAuth callback and get initial session
    const initializeAuth = async () => {
      try {
        // Check if we have OAuth callback tokens in URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          console.log('Processing OAuth callback tokens...');
          
          // Set the session using the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session from OAuth tokens:', error);
            setLoading(false);
          } else {
            console.log('Session set successfully from OAuth tokens:', data.user?.email);
            // Don't set loading to false here - let onAuthStateChange handle it
          }

          // Clean up URL hash after processing but preserve search params
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          // No OAuth tokens, just get existing session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth error:', error);
            setLoading(false);
            return;
          }
          
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          if (data.session?.user) {
            await fetchUserProfile(data.session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      console.log('Current pathname:', window.location.pathname);
      console.log('Session exists:', !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('User signed in, fetching profile...');
        await fetchUserProfile(session.user.id);
        
        // Redirect to dashboard after successful sign in
        if (event === 'SIGNED_IN' && window.location.pathname === '/evt-mngment/') {
          console.log('Redirecting to dashboard...');
          
          // Check URL params for user_type first, then user metadata, then default to 'user'
          const urlParams = new URLSearchParams(window.location.search);
          const userTypeFromUrl = urlParams.get('user_type');
          const userType = userTypeFromUrl || session.user.user_metadata?.user_type || 'user';
          
          const redirectPath = userType === 'provider' ? '/evt-mngment/provider-dashboard' : '/evt-mngment/dashboard';
          console.log(`Redirecting ${session.user.email} to ${redirectPath} (user_type: ${userType})`);
          
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1000); // Small delay to ensure session is fully set
        }
      } else {
        console.log('No user session, setting loading to false');
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          providers (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user profile');
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: userData.name,
          email: email,
          type: userData.type || 'user'
        });

      if (profileError) {
        throw profileError;
      }

      // If provider, create provider profile
      if (userData.type === 'provider') {
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            user_id: authData.user.id,
            business_name: userData.business_name,
            provider_type: userData.provider_type,
            phone: userData.phone,
            location_city: userData.location_city,
            location_province: userData.location_province,
            location_lat: userData.location_lat,
            location_lng: userData.location_lng,
            description: userData.description,
            tags: userData.tags || []
          });

        if (providerError) {
          throw providerError;
        }
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      
      // For demo purposes, redirect to dashboard immediately
      // In production, wait for email verification
      if (userData.type === 'user') {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Signed in successfully!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (userType: 'user' | 'provider' = 'user') => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/evt-mngment/?user_type=${userType}`,
          queryParams: {
            user_type: userType
          }
        }
      });

      if (error) {
        throw error;
      }

      // The redirect will happen automatically
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      setUser(null);
      setSession(null);
      setUserProfile(null);
      toast.success('Signed out successfully!');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in');

      setLoading(true);
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await fetchUserProfile(user.id);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};