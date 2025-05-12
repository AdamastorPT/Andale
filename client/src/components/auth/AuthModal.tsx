import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUIStore, useAuthStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Login schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

// Register schema
const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  newsletter: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const AuthModal = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, setAuthModalTab } = useUIStore();
  const { login } = useAuthStore();
  const { toast } = useToast();
  
  // Login form
  const { 
    register: loginRegister, 
    handleSubmit: handleLoginSubmit, 
    reset: resetLoginForm,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });
  
  // Register form
  const { 
    register: registerRegister, 
    handleSubmit: handleRegisterSubmit, 
    reset: resetRegisterForm,
    formState: { errors: registerErrors, isSubmitting: isRegisterSubmitting } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      newsletter: false,
    },
  });
  
  // Reset forms when modal is closed
  useEffect(() => {
    if (!isAuthModalOpen) {
      resetLoginForm();
      resetRegisterForm();
    }
  }, [isAuthModalOpen, resetLoginForm, resetRegisterForm]);
  
  // Login submit handler
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const { user, token } = await response.json();
      
      login(user, token);
      closeAuthModal();
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };
  
  // Register submit handler
  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'user',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const { user, token } = await response.json();
      
      login(user, token);
      closeAuthModal();
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created successfully.',
      });
      
      // Subscribe to newsletter if checked
      if (data.newsletter) {
        try {
          await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
            }),
          });
        } catch (error) {
          console.error('Failed to subscribe to newsletter:', error);
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };
  
  // Forgot password handler
  const handleForgotPassword = async () => {
    const email = prompt('Please enter your email address');
    
    if (!email) return;
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }
      
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for instructions to reset your password.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password reset failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthModalOpen]);
  
  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={closeAuthModal}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white w-full max-w-md p-6 md:p-8 mx-4 relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 text-medium-gray hover:text-black transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex border-b border-light-gray mb-6">
                <button
                  className={`tab-button pb-3 px-4 font-medium text-medium-gray ${
                    authModalTab === 'login' ? 'text-black border-b-2 border-black' : ''
                  }`}
                  onClick={() => setAuthModalTab('login')}
                >
                  Login
                </button>
                <button
                  className={`tab-button pb-3 px-4 font-medium text-medium-gray ${
                    authModalTab === 'register' ? 'text-black border-b-2 border-black' : ''
                  }`}
                  onClick={() => setAuthModalTab('register')}
                >
                  Register
                </button>
              </div>
              
              {/* Login Form */}
              {authModalTab === 'login' && (
                <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
                  <div className="mb-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...loginRegister('email')}
                      className={loginErrors.email ? 'border-red-500' : ''}
                    />
                    {loginErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...loginRegister('password')}
                      className={loginErrors.password ? 'border-red-500' : ''}
                    />
                    {loginErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Checkbox id="rememberMe" {...loginRegister('rememberMe')} />
                      <label htmlFor="rememberMe" className="ml-2 text-sm">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-black text-white py-3 px-4 font-medium hover:bg-opacity-90"
                    disabled={isLoginSubmitting}
                  >
                    {isLoginSubmitting ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              )}
              
              {/* Register Form */}
              {authModalTab === 'register' && (
                <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                  <div className="mb-4">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      {...registerRegister('name')}
                      className={registerErrors.name ? 'border-red-500' : ''}
                    />
                    {registerErrors.name && (
                      <p className="text-red-500 text-xs mt-1">{registerErrors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      {...registerRegister('email')}
                      className={registerErrors.email ? 'border-red-500' : ''}
                    />
                    {registerErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{registerErrors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      {...registerRegister('password')}
                      className={registerErrors.password ? 'border-red-500' : ''}
                    />
                    {registerErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{registerErrors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      {...registerRegister('confirmPassword')}
                      className={registerErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {registerErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{registerErrors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-6 flex items-start">
                    <Checkbox id="newsletter" {...registerRegister('newsletter')} />
                    <label htmlFor="newsletter" className="ml-2 text-sm">
                      Subscribe to our newsletter
                    </label>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-black text-white py-3 px-4 font-medium hover:bg-opacity-90"
                    disabled={isRegisterSubmitting}
                  >
                    {isRegisterSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
