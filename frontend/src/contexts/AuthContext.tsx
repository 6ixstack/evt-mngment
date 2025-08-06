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
        
        // Redirect to dashboard after successful OAuth sign in (only if we have user_type param)
        if (event === 'SIGNED_IN' && window.location.pathname === '/evt-mngment/') {
          const urlParams = new URLSearchParams(window.location.search);
          const userTypeFromUrl = urlParams.get('user_type');
          
          // Only redirect immediately if this is an OAuth callback (has user_type param)
          if (userTypeFromUrl) {
            console.log('OAuth redirect to dashboard...');
            const userType = userTypeFromUrl || session.user.user_metadata?.user_type || 'user';
            const redirectPath = userType === 'provider' ? '/evt-mngment/provider-dashboard' : '/evt-mngment/dashboard';
            console.log(`Redirecting ${session.user.email} to ${redirectPath} (user_type: ${userType})`);
            
            // Immediate redirect without waiting for profile fetch
            window.location.href = redirectPath;
            return; // Exit early to prevent profile fetch delay
          }
        }
        
        // Fetch profile for other cases (not during OAuth redirect)
        await fetchUserProfile(session.user.id);
        
        // After profile fetch, redirect for regular sign-in
        if (event === 'SIGNED_IN' && window.location.pathname === '/evt-mngment/') {
          const urlParams = new URLSearchParams(window.location.search);
          const userTypeFromUrl = urlParams.get('user_type');
          
          // Only redirect if this is NOT an OAuth callback (no user_type param)
          if (!userTypeFromUrl) {
            console.log('Regular sign-in redirect to dashboard...');
            const userType = session.user.user_metadata?.user_type || 'user';
            const redirectPath = userType === 'provider' ? '/evt-mngment/provider-dashboard' : '/evt-mngment/dashboard';
            console.log(`Redirecting ${session.user.email} to ${redirectPath} (user_type: ${userType})`);
            
            setTimeout(() => {
              window.location.href = redirectPath;
            }, 500); // Small delay to ensure profile is loaded
          }
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
    console.log('=== DIAGNOSTIC: Starting profile fetch ===');
    console.log('User ID:', userId);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    console.log('Environment:', import.meta.env.MODE);
    
    try {
      // First, test basic Supabase connectivity with timeout
      console.log('Testing Supabase connectivity...');
      
      const connectivityPromise = supabase.from('users').select('count').limit(1);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connectivity test timeout')), 3000)
      );
      
      const connectivityTest = await Promise.race([connectivityPromise, timeoutPromise]);
      console.log('Connectivity test result:', connectivityTest);
      
      if (connectivityTest.error) {
        console.error('DIAGNOSTIC: Supabase connectivity failed:', connectivityTest.error);
        console.log('Error details:', {
          message: connectivityTest.error.message,
          code: connectivityTest.error.code,
          details: connectivityTest.error.details,
          hint: connectivityTest.error.hint
        });
        
        // Check if it's a table doesn't exist error
        if (connectivityTest.error.code === '42P01') {
          console.error('DIAGNOSTIC: "users" table does not exist in database');
        } else if (connectivityTest.error.code === '42501') {
          console.error('DIAGNOSTIC: Permission denied - check RLS policies');
        }
        
        setLoading(false);
        return;
      }
      
      console.log('Supabase connectivity OK, fetching user profile...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('DIAGNOSTIC: Profile fetch error:', error);
        console.log('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          console.log('DIAGNOSTIC: User record not found in users table');
        }
      } else {
        console.log('DIAGNOSTIC: Profile fetch successful:', data);
        setUserProfile(data);
      }
    } catch (error: any) {
      console.error('DIAGNOSTIC: Unexpected error:', error);
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      
      if (error.message === 'Connectivity test timeout') {
        console.error('DIAGNOSTIC: Supabase connectivity timeout - possible issues:');
        console.error('1. Supabase project is paused/inactive');
        console.error('2. Network connectivity issues');
        console.error('3. Invalid Supabase URL or credentials');
        console.error('4. Firewall/proxy blocking connection');
      }
    } finally {
      console.log('=== DIAGNOSTIC: Profile fetch completed ===');
      setLoading(false);
    }
  };


  const signUp = async (email: string, password: string, userData: any) => {
    console.log('=== SIGNUP DEBUG: Starting signup process ===');
    console.log('Email:', email);
    console.log('User data:', userData);
    
    try {
      setLoading(true);
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userData.type || 'user',
            full_name: userData.name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      // Update user profile (trigger already created it)
      console.log('Updating user profile type to:', userData.type);
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: userData.name,
          type: userData.type || 'user'
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      console.log('User profile updated successfully');

      // If provider, create provider profile
      if (userData.type === 'provider') {
        console.log('Creating provider profile...', userData);
        const { error: providerError } = await supabase
          .from('providers')
          .insert({
            user_id: authData.user.id,
            business_name: userData.business_name,
            provider_type: userData.provider_type,
            phone: userData.phone,
            location_city: userData.location_city,
            location_province: userData.location_province,
            location_lat: null, // Will be set later via geocoding
            location_lng: null, // Will be set later via geocoding
            description: userData.description,
            tags: userData.tags || []
          });

        if (providerError) {
          console.error('Provider profile creation error:', providerError);
          throw providerError;
        }
        
        console.log('Provider profile created successfully');
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      
      // For demo purposes, redirect to dashboard immediately
      // In production, wait for email verification
      console.log('Redirecting user after sign-up...', userData.type);
      if (userData.type === 'user') {
        window.location.href = '/evt-mngment/dashboard';
      } else if (userData.type === 'provider') {
        window.location.href = '/evt-mngment/provider-dashboard';
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
      // Don't set loading to false here - let onAuthStateChange handle it
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
      throw error;
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