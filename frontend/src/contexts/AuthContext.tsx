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
  createUserProfile: (user: any, userType: string) => Promise<void>;
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
    // Get initial session
    const initializeAuth = async () => {
      try {
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
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: any, userType: string) => {
    console.log('Creating user profile:', { userId: user.id, userType, email: user.email });
    
    const userData = {
      id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
      email: user.email,
      type: userType
    };
    
    console.log('Inserting user data:', userData);
    
    const { error: profileError } = await supabase
      .from('users')
      .insert(userData);

    if (profileError) {
      // If user already exists, try updating
      if (profileError.code === '23505') {
        console.log('User exists, updating instead...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ name: userData.name, type: userType })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }
        console.log('User profile updated successfully');
      } else {
        console.error('Profile creation error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        throw profileError;
      }
    } else {
      console.log('User profile created successfully (new user)');
    }
  };

  const fetchUserProfile = async (userId: string) => {
    console.log('=== DIAGNOSTIC: Starting profile fetch ===');
    console.log('User ID:', userId);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    console.log('Environment:', import.meta.env.MODE);
    
    try {
      // Fetch user profile directly (no unnecessary connectivity test)
      console.log('Fetching user profile...');
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
      console.error('DIAGNOSTIC: Profile fetch error:', error);
      console.log('Error message:', error.message);
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
      
      // Add toast notification for debugging
      toast.loading('Creating your account...', { id: 'signup' });
      
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

      // Create user profile directly (no trigger dependency)
      console.log('Creating user profile with type:', userData.type);
      toast.loading('Setting up your profile...', { id: 'signup' });
      
      const userInsertData = {
        id: authData.user.id,
        name: userData.name,
        email: authData.user.email || email,
        type: userData.type || 'user'
      };
      console.log('Inserting user data:', userInsertData);
      
      const { error: profileError } = await supabase
        .from('users')
        .insert(userInsertData);

      if (profileError) {
        console.error('DETAILED PROFILE ERROR:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // If user already exists (from previous attempt), try updating instead
        if (profileError.code === '23505') {
          console.log('User exists, updating instead...');
          toast.loading('Updating your profile...', { id: 'signup' });
          
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name: userData.name,
              type: userData.type || 'user'
            })
            .eq('id', authData.user.id);
          
          if (updateError) {
            console.error('Profile update error:', updateError);
            toast.error('Failed to update profile: ' + updateError.message, { id: 'signup' });
            throw updateError;
          }
        } else {
          console.error('Profile creation error:', profileError);
          toast.error('Failed to create profile: ' + profileError.message, { id: 'signup' });
          throw profileError;
        }
      }
      
      console.log('User profile created successfully');
      toast.success('Profile created!', { id: 'signup' });

      // If provider, create provider profile
      if (userData.type === 'provider') {
        console.log('Creating provider profile...', userData);
        toast.loading('Setting up provider account...', { id: 'signup' });
        
        const providerData = {
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
        };
        console.log('Inserting provider data:', providerData);
        
        const { error: providerError } = await supabase
          .from('providers')
          .insert(providerData);

        if (providerError) {
          console.error('DETAILED PROVIDER ERROR:', {
            code: providerError.code,
            message: providerError.message,
            details: providerError.details,
            hint: providerError.hint
          });
          toast.error('Failed to create provider profile: ' + providerError.message, { id: 'signup' });
          throw providerError;
        }
        
        console.log('Provider profile created successfully');
      }

      toast.success('Account created successfully!', { id: 'signup' });
      
      // For demo purposes, redirect to dashboard immediately
      // In production, wait for email verification
      console.log('Redirecting user after sign-up...', userData.type);
      if (userData.type === 'user') {
        window.location.href = '/evt-mngment/dashboard';
      } else if (userData.type === 'provider') {
        window.location.href = '/evt-mngment/provider-dashboard';
      }
    } catch (error: any) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('=== END SIGNUP ERROR ===');
      
      toast.error(error.message || 'Failed to create account', { id: 'signup' });
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
      
      // Store user type preference for later use
      sessionStorage.setItem('oauth_user_type', userType);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/evt-mngment/`
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
    createUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};