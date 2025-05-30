
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
  const permissionCache = useRef<Map<string, boolean>>(new Map());

  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    if (!mounted.current) return;
    
    try {
      console.log('Loading user profile for:', supabaseUser.email);
      
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
        // Clear permission cache when user changes
        permissionCache.current.clear();
      }
      
      console.log('User set successfully with role:', userResult.data.user_role);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      if (mounted.current) setUser(null);
      throw error;
    }
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) {
      return false;
    }
    
    // Check cache first to avoid repeated logging
    const cacheKey = `${user.id}-${permission}`;
    if (permissionCache.current.has(cacheKey)) {
      return permissionCache.current.get(cacheKey)!;
    }
    
    let result = false;
    
    // Admin has all permissions
    if (user.user_role === 'admin') {
      result = true;
    } else if (user.permissions && user.permissions.includes(permission as PermissionType)) {
      // Check specific permissions
      result = true;
    } else {
      // Role-based permissions
      const rolePermissions = {
        'saksbehandler': ['view_all_claims', 'edit_all_claims', 'create_claims', 'approve_claims'],
        'avdelingsleder': ['view_department_claims', 'edit_all_claims', 'create_claims', 'approve_claims', 'view_reports'],
        'tekniker': ['edit_own_claims', 'create_claims'],
        'admin': [] // Handled above
      };
      
      const userRolePermissions = rolePermissions[user.user_role] || [];
      result = userRolePermissions.includes(permission);
    }
    
    // Cache the result
    permissionCache.current.set(cacheKey, result);
    
    return result;
  }, [user]);

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

  const logout = useCallback(async () => {
    console.log('Logout initiated');
    try {
      cleanupAuthState();
      loadingUserRef.current = null;
      permissionCache.current.clear();
      
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
          if (loadingUserRef.current === session.user.id) {
            console.log('Already loading user profile for:', session.user.id);
            return;
          }
          
          loadingUserRef.current = session.user.id;
          
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
          permissionCache.current.clear();
        }
      }
    });

    if (!isInitialized) {
      initializeAuth();
    }

    return () => {
      isMounted = false;
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, isInitialized]);

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
