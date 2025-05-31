
import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { cleanupAuthState } from '@/utils/authUtils';
import { Database } from '@/integrations/supabase/types';

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
  const loadingUserRef = useRef<string | null>(null);

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const [userResult, permissionsResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUser.id)
          .single(),
        supabase
          .from('user_permissions')
          .select('permission_name')
          .eq('user_id', supabaseUser.id)
      ]);

      if (userResult.error) {
        console.error('Error loading user:', userResult.error);
        throw userResult.error;
      }

      if (!userResult.data) {
        setUser(null);
        return;
      }

      const permissions = permissionsResult.data?.map(p => p.permission_name) || [];
      
      setUser({
        id: userResult.data.id,
        name: userResult.data.name,
        email: userResult.data.email,
        role: userResult.data.role as User['role'],
        user_role: userResult.data.user_role as UserRole,
        department: userResult.data.department as Department,
        seller_no: userResult.data.seller_no,
        permissions: permissions as PermissionType[],
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setUser(null);
      throw error;
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) {
      return false;
    }
    
    if (user.user_role === 'admin') {
      return true;
    }
    
    if (user.permissions && user.permissions.includes(permission as PermissionType)) {
      return true;
    }
    
    const rolePermissions = {
      'saksbehandler': ['view_all_claims', 'edit_all_claims', 'create_claims', 'approve_claims'],
      'avdelingsleder': ['view_department_claims', 'edit_all_claims', 'create_claims', 'approve_claims', 'view_reports'],
      'tekniker': ['edit_own_claims', 'create_claims'],
      'admin': []
    };
    
    const userRolePermissions = rolePermissions[user.user_role] || [];
    return userRolePermissions.includes(permission);
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue anyway
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
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login exception:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      cleanupAuthState();
      loadingUserRef.current = null;
      
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
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        if (loadingUserRef.current === session.user.id) {
          return;
        }
        
        loadingUserRef.current = session.user.id;
        
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            try {
              await loadUserProfile(session.user);
            } catch (error) {
              console.error('Error loading user profile:', error);
              setUser(null);
            } finally {
              loadingUserRef.current = null;
              setIsLoading(false);
            }
          });
        } else {
          setTimeout(async () => {
            try {
              await loadUserProfile(session.user);
            } catch (error) {
              console.error('Error loading user profile:', error);
              setUser(null);
            } finally {
              loadingUserRef.current = null;
              setIsLoading(false);
            }
          }, 0);
        }
      } else {
        loadingUserRef.current = null;
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
      
      setSession(session);
      
      if (session?.user) {
        if (loadingUserRef.current === session.user.id) {
          return;
        }
        
        loadingUserRef.current = session.user.id;
        
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            try {
              await loadUserProfile(session.user);
            } catch (error) {
              console.error('Error loading user profile on init:', error);
              setUser(null);
            } finally {
              loadingUserRef.current = null;
              setIsLoading(false);
            }
          });
        } else {
          setTimeout(async () => {
            try {
              await loadUserProfile(session.user);
            } catch (error) {
              console.error('Error loading user profile on init:', error);
              setUser(null);
            } finally {
              loadingUserRef.current = null;
              setIsLoading(false);
            }
          }, 0);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const contextValue = useMemo(() => ({
    user,
    session,
    login,
    logout,
    isLoading,
    hasPermission
  }), [user, session, login, logout, isLoading, hasPermission]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
