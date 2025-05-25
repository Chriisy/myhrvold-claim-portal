
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { cleanupAuthState } from '@/utils/authUtils';
import { Database } from '@/integrations/supabase/types';
import { handleSupabaseError } from '@/utils/supabaseErrorHandler';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'technician' | 'sales' | 'manager' | 'finance' | 'admin';
  user_role: UserRole;
  department: Department;
  seller_no?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback user creation for dev environments
  const createFallbackUser = (supabaseUser: SupabaseUser): User => {
    console.warn('Using fallback user profile - DB user not found');
    return {
      id: supabaseUser.id,
      name: supabaseUser.email?.split('@')[0] || 'Unnamed User',
      email: supabaseUser.email || '',
      role: 'technician',
      user_role: 'tekniker',
      department: 'oslo',
    };
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthProvider: Setting up auth state listeners');
    }
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state change:', event, session?.user?.email);
      }
      
      // Update session state immediately
      setSession(session);
      
      if (session?.user) {
        // Defer user profile loading to prevent deadlocks
        setTimeout(async () => {
          try {
            await loadUserProfile(session.user);
          } catch (error) {
            console.error('Error loading user profile:', error);
            // Use fallback user for development environments
            if (process.env.NODE_ENV === 'development') {
              setUser(createFallbackUser(session.user));
            } else {
              setUser(null);
            }
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        cleanupAuthState();
        setIsLoading(false);
        return;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Initial session check:', session?.user?.email);
      }
      setSession(session);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            await loadUserProfile(session.user);
          } catch (error) {
            console.error('Error loading user profile on init:', error);
            // Use fallback user for development environments
            if (process.env.NODE_ENV === 'development') {
              setUser(createFallbackUser(session.user));
            } else {
              setUser(null);
            }
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('AuthProvider: Cleaning up auth subscription');
      }
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading user profile for:', supabaseUser.email);
      }
      
      // Prøv først direkte forespørsel
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        // Hvis vi får RLS infinite recursion, prøv en alternativ tilnærming
        if (error.code === '42P17') {
          console.warn('RLS recursion detected, using auth user data only');
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata.name || supabaseUser.email?.split('@')[0] || 'User',
            role: 'technician',
            user_role: 'tekniker',
            department: 'oslo',
          });
          return;
        }
        
        console.error('Error loading user profile:', error);
        throw error;
      }

      // If user exists in users table, use that data
      if (userData) {
        if (process.env.NODE_ENV === 'development') {
          console.log('User profile loaded from database:', userData);
        }
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as User['role'],
          user_role: userData.user_role as UserRole,
          department: userData.department as Department,
          seller_no: userData.seller_no,
        });
      } else {
        // User not found - normal during dev or first login
        console.warn('User not found in database - using fallback');
        setUser(createFallbackUser(supabaseUser));
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        setUser(createFallbackUser(supabaseUser));
      } else {
        setUser(null);
      }
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.user_role === 'admin') return true;
    
    // Basic role-based permissions
    switch (user.user_role) {
      case 'saksbehandler':
        return ['view_all_claims', 'edit_all_claims', 'create_claims', 'approve_claims'].includes(permission);
      case 'avdelingsleder':
        return ['view_department_claims', 'edit_all_claims', 'create_claims', 'approve_claims', 'view_reports'].includes(permission);
      case 'tekniker':
        return ['edit_own_claims', 'create_claims'].includes(permission);
      default:
        return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Login attempt for:', email);
    }
    setIsLoading(true);
    
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
        if (process.env.NODE_ENV === 'development') {
          console.log('Global sign out completed');
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Global sign out failed (continuing anyway):', err);
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user && data.session) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Login successful, user:', data.user.email);
        }
        // Don't manually load user profile here - let onAuthStateChange handle it
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Logout initiated');
    }
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Sign out error (continuing anyway):', err);
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Force page reload for clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload even if logout fails
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
