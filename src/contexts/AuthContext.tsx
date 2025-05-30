
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadingUserRef = useRef<string | null>(null);
  const mounted = useRef(true);

  // Memoize the expensive user profile loading function
  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    if (!mounted.current) return;
    
    try {
      console.log('Loading user profile for:', supabaseUser.email);
      
      // Use Promise.all to fetch user data and permissions in parallel
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
        console.warn('User not found in database');
        if (mounted.current) setUser(null);
        return;
      }

      const permissions = permissionsResult.data?.map(p => p.permission_name) || [];
      
      console.log('User profile loaded:', {
        id: userResult.data.id,
        role: userResult.data.user_role,
        permissions: permissions
      });
      
      if (mounted.current) {
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
      }
      
      console.log('User set successfully with role:', userResult.data.user_role);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      if (mounted.current) setUser(null);
      throw error;
    }
  }, []);

  // Memoize the permission check function
  const hasPermission = useCallback((permission: string): boolean => {
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
  }, [user]);

  // Memoize the login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
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
  }, []);

  // Memoize the logout function
  const logout = useCallback(async () => {
    console.log('Logout initiated');
    try {
      cleanupAuthState();
      loadingUserRef.current = null;
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Sign out error (continuing anyway):', err);
      }
      
      if (mounted.current) {
        setUser(null);
        setSession(null);
      }
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    mounted.current = true;
    
    const initializeAuth = async () => {
      if (isInitialized) return;
      
      try {
        console.log('AuthProvider: Initializing auth');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(session);
          if (session?.user) {
            await loadUserProfile(session.user);
          }
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (isMounted) {
        setSession(session);
        
        if (session?.user) {
          // Prevent multiple simultaneous user profile loads for the same user
          if (loadingUserRef.current === session.user.id) {
            console.log('Already loading user profile for:', session.user.id);
            return;
          }
          
          loadingUserRef.current = session.user.id;
          
          // Use setTimeout to defer the user profile loading
          setTimeout(async () => {
            try {
              await loadUserProfile(session.user);
            } catch (error) {
              console.error('Error loading user profile:', error);
              if (isMounted) setUser(null);
            } finally {
              loadingUserRef.current = null;
              if (isMounted) setIsLoading(false);
            }
          }, 0);
        } else {
          loadingUserRef.current = null;
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    // Initialize only once
    if (!isInitialized) {
      initializeAuth();
    }

    return () => {
      isMounted = false;
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, isInitialized]);

  // Memoize the context value to prevent unnecessary re-renders
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
