
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { cleanupAuthState } from '@/utils/authUtils';
import { Database } from '@/integrations/supabase/types';
import { handleSupabaseError } from '@/utils/supabaseErrorHandler';

type UserRole = Database['public']['Enums']['user_role'];
type Department = Database['public']['Enums']['department'];
type PermissionType = Database['public']['Enums']['permission_type'];

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'technician' | 'sales' | 'manager' | 'finance' | 'admin';
  user_role: UserRole;
  department: Department;
  seller_no?: number;
  permissions?: PermissionType[];
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

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listeners');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      setSession(session);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            await loadUserProfile(session.user);
          } catch (error) {
            console.error('Error loading user profile:', error);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        cleanupAuthState();
        setIsLoading(false);
        return;
      }
      
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            await loadUserProfile(session.user);
          } catch (error) {
            console.error('Error loading user profile on init:', error);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Loading user profile for:', supabaseUser.email);
      
      // First get user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (userError) {
        console.error('Error loading user:', userError);
        throw userError;
      }

      if (!userData) {
        console.warn('User not found in database');
        setUser(null);
        return;
      }

      // Then get permissions separately
      const { data: permissionsData, error: permError } = await supabase
        .from('user_permissions')
        .select('permission_name')
        .eq('user_id', supabaseUser.id);

      if (permError) {
        console.error('Error loading permissions:', permError);
        // Continue without permissions rather than failing completely
      }

      const permissions = permissionsData?.map(p => p.permission_name) || [];
      
      console.log('User profile loaded:', {
        id: userData.id,
        role: userData.user_role,
        permissions: permissions
      });
      
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as User['role'],
        user_role: userData.user_role as UserRole,
        department: userData.department as Department,
        seller_no: userData.seller_no,
        permissions: permissions as PermissionType[],
      });
      
      console.log('User set successfully with role:', userData.user_role);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUser(null);
      throw error;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) {
      console.log('hasPermission: No user');
      return false;
    }
    
    console.log('Checking permission:', permission, 'for user role:', user.user_role);
    
    // Admin has all permissions
    if (user.user_role === 'admin') {
      console.log('User is admin, has permission:', permission);
      return true;
    }
    
    // Check specific permissions
    if (user.permissions && user.permissions.includes(permission as PermissionType)) {
      console.log('User has specific permission:', permission);
      return true;
    }
    
    // Role-based permissions
    const rolePermissions = {
      'saksbehandler': ['view_all_claims', 'edit_all_claims', 'create_claims', 'approve_claims'],
      'avdelingsleder': ['view_department_claims', 'edit_all_claims', 'create_claims', 'approve_claims', 'view_reports'],
      'tekniker': ['edit_own_claims', 'create_claims'],
      'admin': [] // Handled above
    };
    
    const userRolePermissions = rolePermissions[user.user_role] || [];
    const hasRolePermission = userRolePermissions.includes(permission);
    
    console.log('Role-based permission check:', permission, 'result:', hasRolePermission);
    return hasRolePermission;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', email);
    setIsLoading(true);
    
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Global sign out completed');
      } catch (err) {
        console.log('Global sign out failed (continuing anyway):', err);
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
        console.log('Login successful, user:', data.user.email);
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
    console.log('Logout initiated');
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Sign out error (continuing anyway):', err);
      }
      
      setUser(null);
      setSession(null);
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, isLoading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
