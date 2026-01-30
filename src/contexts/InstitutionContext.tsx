import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Institution } from '@/types/database';

interface InstitutionContextType {
  institution: Institution | null;
  institutionId: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  setActiveInstitution: (id: string) => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export function InstitutionProvider({ children }: { children: ReactNode }) {
  const { user, isSuperAdmin, loading: authLoading } = useAuth();
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null);

  // Fetch user's institution from profile with fallback to user_roles
  const { data: institutionData, isLoading: institutionIdLoading, isFetched: institutionIdFetched } = useQuery({
    queryKey: ['user-institution-id', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // First try to get from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('user_id', user.id)
        .single();
      
      // If profile fetch failed due to auth issues, return null gracefully
      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError.message);
        return null;
      }
      
      if (profile?.institution_id) {
        return profile.institution_id;
      }
      
      // Fallback: check user_roles for institution_id
      const { data: role } = await supabase
        .from('user_roles')
        .select('institution_id')
        .eq('user_id', user.id)
        .not('institution_id', 'is', null)
        .limit(1)
        .maybeSingle();
      
      return role?.institution_id || null;
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes - reduce re-fetching
    retry: 2, // Retry on failure
    retryDelay: 1000,
  });

  // Sync institution from profile/roles - always use profile's institution for non-super-admins
  useEffect(() => {
    if (institutionData) {
      // For non-super-admins, always use their assigned institution
      // Super admins can switch institutions, but start with their assigned institution
      if (!isSuperAdmin || !activeInstitutionId) {
        setActiveInstitutionId(institutionData);
      }
    }
  }, [institutionData, isSuperAdmin]);

  // Fetch institution details
  const { data: institution, isLoading: institutionDetailsLoading, error, refetch } = useQuery({
    queryKey: ['institution', activeInstitutionId],
    queryFn: async () => {
      if (!activeInstitutionId) return null;
      
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', activeInstitutionId)
        .single();
      
      if (error) throw error;
      return data as Institution;
    },
    enabled: !!activeInstitutionId,
  });

  // Combined loading state - only loading if actively fetching
  // Not loading if we don't have a user yet, or if queries have completed
  const isLoading = authLoading || 
    (!!user?.id && institutionIdLoading) || 
    (!!activeInstitutionId && institutionDetailsLoading);

  const setActiveInstitution = (id: string) => {
    setActiveInstitutionId(id);
  };

  return (
    <InstitutionContext.Provider
      value={{
        institution,
        institutionId: activeInstitutionId,
        isLoading,
        error: error as Error | null,
        refetch,
        setActiveInstitution,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution() {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
}
