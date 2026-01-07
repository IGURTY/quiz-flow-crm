import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '@/types/crm';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  loginWithOTP: (phone: string, otp: string) => Promise<boolean>;
  requestOTP: (phone: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginAdmin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const adminUser = mockUsers.find(u => u.email === email && u.role === 'admin');
    if (adminUser && password === 'admin123') {
      setUser(adminUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const requestOTP = useCallback(async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate Evolution API OTP request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userExists = mockUsers.find(u => u.phone === phone && u.role === 'user');
    setIsLoading(false);
    return !!userExists;
  }, []);

  const loginWithOTP = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.phone === phone && u.role === 'user');
    if (foundUser && otp === '123456') {
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginAdmin,
        loginWithOTP,
        requestOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
