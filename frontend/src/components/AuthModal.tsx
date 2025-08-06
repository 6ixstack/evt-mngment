import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  mode: 'signin' | 'signup' | 'provider-signup';
  onClose: () => void;
  onModeChange: (mode: 'signin' | 'signup' | 'provider-signup') => void;
}

type SignInFormData = {
  email: string;
  password: string;
};

type SignUpFormData = {
  name: string;
  email: string;
  password: string;
};

type ProviderSignUpFormData = {
  name: string;
  email: string;
  password: string;
  business_name: string;
  provider_type: string;
  phone: string;
  location_city: string;
  location_province: string;
  description: string;
  tags: string;
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onModeChange
}) => {
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const signInForm = useForm<SignInFormData>();
  const signUpForm = useForm<SignUpFormData>();
  const providerForm = useForm<ProviderSignUpFormData>();

  const handleSignIn = async (data: SignInFormData) => {
    try {
      await signIn(data.email, data.password);
      onClose();
      signInForm.reset();
    } catch (error) {
      // Error handled by context
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    try {
      console.log('=== USER SIGNUP MODAL DEBUG ===');
      console.log('Form data:', data);
      console.log('Calling signUp with user type');
      
      await signUp(data.email, data.password, {
        name: data.name,
        type: 'user'
      });
      
      console.log('User signup successful, closing modal');
      onClose();
      signUpForm.reset();
    } catch (error) {
      console.error('USER SIGNUP MODAL ERROR:', error);
      // Don't swallow the error - let it bubble up
      throw error;
    }
  };

  const handleProviderSignUp = async (data: ProviderSignUpFormData) => {
    try {
      console.log('=== PROVIDER SIGNUP MODAL DEBUG ===');
      console.log('Form data:', data);
      console.log('Calling signUp with provider type');
      
      await signUp(data.email, data.password, {
        name: data.name,
        type: 'provider',
        business_name: data.business_name,
        provider_type: data.provider_type,
        phone: data.phone,
        location_city: data.location_city,
        location_province: data.location_province,
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
      
      console.log('Provider signup successful, closing modal');
      onClose();
      providerForm.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error('PROVIDER SIGNUP MODAL ERROR:', error);
      // Don't swallow the error - let it bubble up
      throw error;
    }
  };

  const providerTypes = [
    { value: 'venue', label: 'Venue' },
    { value: 'catering', label: 'Catering' },
    { value: 'photographer', label: 'Photographer' },
    { value: 'videographer', label: 'Videographer' },
    { value: 'florist', label: 'Florist' },
    { value: 'decorator', label: 'Decorator' },
    { value: 'music', label: 'Music/DJ' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'makeup', label: 'Makeup Artist' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'invitations', label: 'Invitations' },
    { value: 'other', label: 'Other' }
  ];

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  const getTabValue = () => {
    switch (mode) {
      case 'signin': return 'signin';
      case 'signup': return 'signup';
      case 'provider-signup': return 'provider';
      default: return 'signin';
    }
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'signin': onModeChange('signin'); break;
      case 'signup': onModeChange('signup'); break;
      case 'provider': onModeChange('provider-signup'); break;
    }
    setCurrentStep(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Start Planning Your Dream Event'}
            {mode === 'provider-signup' && 'Join EventCraft as a Provider'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={getTabValue()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="provider">Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...signInForm.register('email', { required: true })}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...signInForm.register('password', { required: true })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
                
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => signInWithGoogle('user')}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full name"
                      {...signUpForm.register('name', { required: true })}
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...signUpForm.register('email', { required: true })}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      {...signUpForm.register('password', { required: true, minLength: 6 })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
                
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => signInWithGoogle('user')}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provider" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold">Personal Information</h3>
                    <div>
                      <Input
                        type="text"
                        placeholder="Full name"
                        {...providerForm.register('name', { required: true })}
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Email address"
                        {...providerForm.register('email', { required: true })}
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        {...providerForm.register('password', { required: true, minLength: 6 })}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-semibold">Business Information</h3>
                    <form onSubmit={providerForm.handleSubmit(handleProviderSignUp)} className="space-y-4">
                      <div>
                        <Input
                          type="text"
                          placeholder="Business name"
                          {...providerForm.register('business_name', { required: true })}
                        />
                      </div>
                      <div>
                        <select
                          className="input w-full"
                          {...providerForm.register('provider_type', { required: true })}
                        >
                          <option value="">Select service type</option>
                          {providerTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Input
                          type="tel"
                          placeholder="Phone number"
                          {...providerForm.register('phone', { required: true })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="City"
                          {...providerForm.register('location_city', { required: true })}
                        />
                        <select
                          className="input"
                          {...providerForm.register('location_province', { required: true })}
                        >
                          <option value="">Province</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <textarea
                          className="input min-h-[80px] resize-none"
                          placeholder="Describe your services (max 200 words)"
                          {...providerForm.register('description', { required: true, maxLength: 1000 })}
                        />
                      </div>
                      <div>
                        <Input
                          type="text"
                          placeholder="Tags (e.g., halal, luxury, outdoor)"
                          {...providerForm.register('tags')}
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setCurrentStep(1)}
                        >
                          Back
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Create Provider Account'}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}
                
                {/* Google OAuth for Provider */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => signInWithGoogle('provider')}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign up as Provider with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};