import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Language } from '@/types';
import { UserRole } from '@/types/capacityConnect';
import { capacityStore } from '@/services/capacityStore';

export interface User {
  id: string;
  email: string;
  name: string;
  language: Language;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  loading: boolean;
  loginAsGuest: (guestRole?: UserRole) => void;
  signUp: (email: string, password: string, name: string, language: Language, role?: UserRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const getInitialRole = (): UserRole => capacityStore.getActiveRole();

  const createGuestUser = (targetRole: UserRole): User => {
    const lang = (localStorage.getItem('user_language') as Language) || 'en';
    const names: Record<UserRole, string> = {
      trainee: 'Pavan Kumar (Trainee)',
      trainer: 'Dr. Priya Sharma (Trainer)',
      admin: 'System Administrator'
    };
    return {
      id: 'guest',
      email: `${targetRole}@pathfinders.org`,
      name: names[targetRole] || 'Trainee User',
      language: lang,
      role: targetRole
    };
  };

  const [role, setRoleState] = useState<UserRole>(getInitialRole);
  const [user, setUser] = useState<User | null>(() => {
    const hasRoleSelected = localStorage.getItem('cc_role_selected') === 'true';
    if (hasRoleSelected) {
      return createGuestUser(getInitialRole());
    }
    return null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const setRole = (newRole: UserRole) => {
    capacityStore.setActiveRole(newRole);
    setRoleState(newRole);
    const names: Record<UserRole, string> = {
      trainee: 'Pavan Kumar (Trainee)',
      trainer: 'Dr. Priya Sharma (Trainer)',
      admin: 'System Administrator'
    };
    if (user) {
      setUser(prev => prev ? { 
        ...prev, 
        role: newRole,
        name: prev.id === 'guest' ? (names[newRole] || prev.name) : prev.name
      } : null);
    }
  };

  const loginAsGuest = (guestRole?: UserRole) => {
    const target = guestRole || role || 'trainee';
    capacityStore.setActiveRole(target);
    setRoleState(target);
    setUser(createGuestUser(target));
    localStorage.setItem('cc_role_selected', 'true');
  };

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: never stay loading longer than 4 seconds
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('[AuthContext] Safety timeout reached, forcing loading=false');
        setLoading(false);
      }
    }, 4000);

    try {
      // Set up auth state listener FIRST
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!isMounted) return;
          setSession(session);
          if (session?.user) {
            // Defer profile fetching to avoid blocking
            setTimeout(() => {
              if (isMounted) fetchUserProfile(session.user.id);
            }, 0);
          } else {
            setUser(null);
          }
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      );

      // THEN check for existing session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.error('[AuthContext] getSession error:', error);
        }
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
        setLoading(false);
        clearTimeout(safetyTimeout);
      }).catch((err) => {
        if (!isMounted) return;
        console.error('[AuthContext] getSession failed:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
        clearTimeout(safetyTimeout);
      });

      return () => {
        isMounted = false;
        clearTimeout(safetyTimeout);
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('[AuthContext] Auth setup error:', err);
      if (isMounted) {
        setLoading(false);
      }
      clearTimeout(safetyTimeout);
      return () => { isMounted = false; clearTimeout(safetyTimeout); };
    }
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const metaRole = (authUser?.user_metadata?.role as UserRole) || (data?.role as UserRole);
      const effectiveRole = metaRole || capacityStore.getActiveRole() || 'trainee';
      capacityStore.setActiveRole(effectiveRole);
      setRoleState(effectiveRole);

      if (data) {
        setUser({
          id: data.user_id,
          email: authUser?.email || '',
          name: data.name,
          language: (data.language as Language) || 'en',
          role: effectiveRole
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string, language: Language, userRole?: UserRole) => {
    try {
      if (userRole) {
        capacityStore.setActiveRole(userRole);
        setRoleState(userRole);
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            language,
            role: userRole || 'trainee'
          }
        }
      });

      return { error };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      return { error: new Error(error.message || 'Failed to create account') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      return { error: new Error(error.message || 'Failed to sign in') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      // Keep language preference persistent across sessions as required
      // Do NOT clear pf_lang_selected on logout
    } catch (error: any) {
      console.error('Error in signOut:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateLanguage = async (language: Language) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ language })
        .eq('user_id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, language } : null);
    } catch (error: any) {
      console.error('Error updating language:', error);
      throw new Error(error.message || 'Failed to update language');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    role,
    setRole,
    loading,
    loginAsGuest,
    signUp,
    signIn,
    signOut,
    updateLanguage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};