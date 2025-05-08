
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../lib/types';
import * as authService from '../lib/auth';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, profileData: Partial<Profile>) => Promise<boolean>;
  logout: () => Promise<void>;
  subscriptionTier: 'basic' | 'premium' | 'elite';
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  subscriptionTier: 'basic',
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.initAuth();
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.loginUser(email, password);
      
      if (result.success && result.profile && result.token) {
        setUser(result.profile);
        authService.setCurrentUser(result.profile, result.token);
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, profileData: Partial<Profile>) => {
    setIsLoading(true);
    try {
      const result = await authService.registerUser(email, password, profileData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Registration successful. Please log in.",
        });
        return true;
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during registration",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (authService.getAuthToken()) {
      await authService.logoutUser(authService.getAuthToken()!);
    }
    setUser(null);
    authService.setCurrentUser(null, null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const subscriptionTier = user?.subscription_tier || 'basic';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      subscriptionTier,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
