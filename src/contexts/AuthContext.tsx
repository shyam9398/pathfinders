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
    // Admin role requires authenticated Supabase session - never grant to guest
    const safeRole: UserRole = targetRole === 'admin' ? 'trainee' : targetRole;
    const names: Record<UserRole, string> = {
      trainee: 'Pavan Kumar (Trainee)',
      trainer: 'Dr. Priya Sharma (Trainer)',
      admin: 'Trainee User'
    };
    return {
      id: 'guest',
      email: `${safeRole}@pathfinders.org`,
      name: names[safeRole] || 'Trainee User',
      language: lang,
      role: safeRole
    };
  };

  const [role, setRoleState] = useState<UserRole>(() => {
    const init = getInitialRole();
    return init === 'admin' ? 'trainee' : init;
  });
  const [user, setUser] = useState<User | null>(() => {
    const hasRoleSelected = localStorage.getItem('cc_role_selected') === 'true';
    if (hasRoleSelected) {
      const init = getInitialRole();
      return createGuestUser(init === 'admin' ? 'trainee' : init);
    }
    return null;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize language without logging out
  useEffect(() => {
    const handleGlobalLangChange = (e: any) => {
      const newLang = e?.detail?.language;
      if (newLang) {
        setUser(prev => (prev ? { ...prev, language: newLang } : null));
      }
    };
    window.addEventListener('languageChange', handleGlobalLangChange);
    return () => window.removeEventListener('languageChange', handleGlobalLangChange);
  }, []);

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
    // Admin access cannot be accessed as guest
    const target = (guestRole === 'admin' ? 'trainee' : guestRole) || (role === 'admin' ? 'trainee' : role) || 'trainee';
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
      
      // 1. Primary: Query public.profiles
      let profileData: any = null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (profile) profileData = profile;
      } catch (err) {
        console.warn('[AuthContext] profiles lookup note:', err);
      }

      // 2. Fallback: Query public.user_profiles if profiles record does not exist
      if (!profileData) {
        try {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          if (userProfile) profileData = userProfile;
        } catch (err) {
          console.warn('[AuthContext] user_profiles fallback note:', err);
        }
      }

      const rawRole = profileData?.role || authUser?.user_metadata?.role;
      const mappedRole: UserRole = (rawRole === 'admin') 
        ? 'admin' 
        : (rawRole === 'trainer') 
        ? 'trainer' 
        : 'trainee';

      const effectiveRole: UserRole = mappedRole || (capacityStore.getActiveRole() === 'admin' ? 'trainee' : capacityStore.getActiveRole()) || 'trainee';
      capacityStore.setActiveRole(effectiveRole);
      setRoleState(effectiveRole);

      setUser({
        id: userId,
        email: authUser?.email || profileData?.email || '',
        name: profileData?.full_name || profileData?.name || authUser?.user_metadata?.name || 'User',
        language: (profileData?.language as Language) || (authUser?.user_metadata?.language as Language) || 'en',
        role: effectiveRole
      });
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
            full_name: name,
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
      localStorage.removeItem('cc_role_selected');
      const { error } = await supabase.auth.signOut();
      if (error) console.error('SignOut error:', error);
      setUser(null);
      setSession(null);
      setRoleState('trainee');
      capacityStore.setActiveRole('trainee');
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