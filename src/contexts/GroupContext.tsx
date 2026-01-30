import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InstitutionGroup, GroupRole, GroupUserRole, GroupCampus } from '@/types/group';

interface GroupContextType {
  // Current group
  group: InstitutionGroup | null;
  groupId: string | null;
  setActiveGroup: (id: string | null) => void;
  
  // Campuses in group
  campuses: GroupCampus[];
  activeCampus: GroupCampus | null;
  setActiveCampus: (id: string | null) => void;
  
  // User's group access
  isGroupUser: boolean;
  groupRole: GroupRole | null;
  userGroupRoles: GroupUserRole[];
  canAccessAllCampuses: boolean;
  
  // Loading states
  isLoading: boolean;
  
  // Helpers
  refreshGroup: () => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeCampusId, setActiveCampusId] = useState<string | null>(null);

  // Handle newGroup URL parameter
  const newGroupFromUrl = searchParams.get('newGroup');
  
  useEffect(() => {
    if (newGroupFromUrl && newGroupFromUrl !== activeGroupId) {
      setActiveGroupId(newGroupFromUrl);
      // Clear the param to avoid stale state
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('newGroup');
      setSearchParams(newParams, { replace: true });
    }
  }, [newGroupFromUrl, activeGroupId, searchParams, setSearchParams]);

  // Fetch user's group roles
  const { data: userGroupRoles, isLoading: isLoadingRoles, refetch: refetchRoles } = useQuery({
    queryKey: ['user-group-roles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_user_roles')
        .select('*')
        .eq('user_id', user!.id);
      
      if (error) throw error;
      return data as GroupUserRole[];
    },
    enabled: !!user,
  });

  // Set default active group from user's roles (only if no URL param set it)
  useEffect(() => {
    if (userGroupRoles && userGroupRoles.length > 0 && !activeGroupId && !newGroupFromUrl) {
      setActiveGroupId(userGroupRoles[0].group_id);
    }
  }, [userGroupRoles, activeGroupId, newGroupFromUrl]);

  // Fetch active group details
  const { data: group, isLoading: isLoadingGroup, refetch: refetchGroup } = useQuery({
    queryKey: ['active-group', activeGroupId],
    queryFn: async () => {
      if (!activeGroupId) return null;
      
      const { data, error } = await supabase
        .from('institution_groups')
        .select('*')
        .eq('id', activeGroupId)
        .single();
      
      if (error) throw error;
      return data as InstitutionGroup;
    },
    enabled: !!activeGroupId,
  });

  // Fetch campuses for active group
  const { data: campuses, isLoading: isLoadingCampuses } = useQuery({
    queryKey: ['group-campuses-context', activeGroupId],
    queryFn: async () => {
      if (!activeGroupId) return [];
      
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name, code, campus_code, is_headquarters, status, student_count, staff_count, country')
        .eq('group_id', activeGroupId)
        .order('is_headquarters', { ascending: false })
        .order('name');
      
      if (error) throw error;
      return data as GroupCampus[];
    },
    enabled: !!activeGroupId,
  });

  // Get current role for active group
  const currentGroupRole = userGroupRoles?.find(r => r.group_id === activeGroupId);
  
  // Get active campus
  const activeCampus = campuses?.find(c => c.id === activeCampusId) ?? null;

  // Check if user can access all campuses (null campus_access means all)
  const canAccessAllCampuses = currentGroupRole?.campus_access === null;

  const setActiveGroup = (id: string | null) => {
    setActiveGroupId(id);
    setActiveCampusId(null); // Reset campus when changing group
  };

  const setActiveCampus = (id: string | null) => {
    setActiveCampusId(id);
  };

  const refreshGroup = () => {
    refetchRoles();
    refetchGroup();
  };

  const value: GroupContextType = {
    group,
    groupId: activeGroupId,
    setActiveGroup,
    campuses: campuses ?? [],
    activeCampus,
    setActiveCampus,
    isGroupUser: (userGroupRoles?.length ?? 0) > 0,
    groupRole: currentGroupRole?.role ?? null,
    userGroupRoles: userGroupRoles ?? [],
    canAccessAllCampuses,
    isLoading: isLoadingRoles || isLoadingGroup || isLoadingCampuses,
    refreshGroup,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
}
