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
        // Clear OAuth user type on sign out or auth failure
        sessionStorage.removeItem('oauth_user_type');
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
    console.log('Fetching user profile for:', userId);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is ok for new users
          console.log('No user profile found yet');
          setUserProfile(null);
        } else {
          console.error('Profile fetch error:', error);
        }
      } else {
        console.log('Profile fetched:', data);
        setUserProfile(data);
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };


  const signUp = async (email: string, password: string, userData: any) => {
    console.log('Starting signup:', { email, userData });
    
    try {
      setLoading(true);
      toast.loading('Creating your account...', { id: 'signup' });
      
      // Step 1: Sign up with Supabase Auth
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
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      console.log('Auth user created:', authData.user.id);

      // Step 2: Create user profile
      const userProfileData = {
        id: authData.user.id,
        name: userData.name,
        email: authData.user.email || email,
        type: userData.type || 'user'
      };
      
      console.log('Creating user profile:', userProfileData);
      
      const { error: profileError } = await supabase
        .from('users')
        .insert(userProfileData);

      if (profileError && profileError.code !== '23505') {
        // Ignore duplicate key errors, throw others
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // Step 3: If provider, create provider profile
      if (userData.type === 'provider' && userData.business_name) {
        console.log('Creating provider profile...');
        
        const providerData = {
          user_id: authData.user.id,
          business_name: userData.business_name,
          provider_type: userData.provider_type,
          phone: userData.phone,
          location_city: userData.location_city,
          location_province: userData.location_province,
          description: userData.description,
          tags: userData.tags || []
        };
        
        const { error: providerError } = await supabase
          .from('providers')
          .insert(providerData);

        if (providerError && providerError.code !== '23505') {
          console.error('Provider profile error:', providerError);
          throw new Error(`Provider profile creation failed: ${providerError.message}`);
        }
      }

      toast.success('Account created successfully!', { id: 'signup' });
      
      // Redirect based on user type
      setTimeout(() => {
        if (userData.type === 'provider') {
          window.location.href = '/evt-mngment/provider-dashboard';
        } else {
          window.location.href = '/evt-mngment/dashboard';
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account', { id: 'signup' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success('Signed in successfully!');
        
        // Fetch the user profile to determine where to redirect
        const { data: profile } = await supabase
          .from('users')
          .select('type')
          .eq('id', data.user.id)
          .single();
        
        // Redirect based on user type
        setTimeout(() => {
          if (profile?.type === 'provider') {
            window.location.href = '/evt-mngment/provider-dashboard';
          } else {
            window.location.href = '/evt-mngment/dashboard';
          }
        }, 1000);
      }
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
      
      // Store user type preference for OAuth callback
      sessionStorage.setItem('oauth_user_type', userType);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/evt-mngment/`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        sessionStorage.removeItem('oauth_user_type');
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      sessionStorage.removeItem('oauth_user_type');
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