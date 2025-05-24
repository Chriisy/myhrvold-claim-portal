
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'technician' | 'sales' | 'manager' | 'finance' | 'admin';
  seller_no?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('myhrvold_token');
    const userData = localStorage.getItem('myhrvold_user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('myhrvold_token');
        localStorage.removeItem('myhrvold_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock authentication - in real app this would be Supabase auth
    if (email === 'admin@myhrvold.no' && password === 'admin123') {
      const mockUser: User = {
        id: '1',
        name: 'Myhrvold Admin',
        email: 'admin@myhrvold.no',
        role: 'admin'
      };
      
      setUser(mockUser);
      localStorage.setItem('myhrvold_token', 'mock-jwt-token');
      localStorage.setItem('myhrvold_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('myhrvold_token');
    localStorage.removeItem('myhrvold_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
