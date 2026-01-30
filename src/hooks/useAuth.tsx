import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserRole {
  role: string;
  institution_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  rolesLoading: boolean;
  isSuperAdmin: boolean;
  isSupportAdmin: boolean;
  userRoles: UserRole[];
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  hasRole: (role: string) => boolean;
  hasInstitutionRole: (role: string, institutionId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isSupportAdmin, setIsSupportAdmin] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check roles after auth state changes
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsSuperAdmin(false);
          setIsSupportAdmin(false);
          setUserRoles([]);
          setRolesLoading(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoles = async (userId: string) => {
    setRolesLoading(true);
    try {
      // Check super admin status
      const { data: superAdminData } = await supabase.rpc('is_super_admin', { _user_id: userId });
      setIsSuperAdmin(superAdminData ?? false);

      // Check support admin status
      const { data: supportAdminData } = await supabase.rpc('is_support_admin', { _user_id: userId });
      setIsSupportAdmin(supportAdminData ?? false);

      // Get all user roles
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select('role, institution_id')
        .eq('user_id', userId);

      if (!error && rolesData) {
        setUserRoles(rolesData.map(r => ({
          role: r.role,
          institution_id: r.institution_id,
        })));
      }
    } catch (err) {
      console.error('Error checking user roles:', err);
      setIsSuperAdmin(false);
      setIsSupportAdmin(false);
      setUserRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.some(r => r.role === role);
  };

  const hasInstitutionRole = (role: string, institutionId: string): boolean => {
    return userRoles.some(r => r.role === role && r.institution_id === institutionId);
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsSuperAdmin(false);
    setIsSupportAdmin(false);
    setUserRoles([]);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      rolesLoading,
      isSuperAdmin,
      isSupportAdmin,
      userRoles,
      signUp, 
      signIn, 
      signOut,
      resetPassword,
      updatePassword,
      hasRole,
      hasInstitutionRole,
    }}>
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
