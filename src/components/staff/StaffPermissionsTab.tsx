import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useModuleWithConfig } from '@/hooks/useModuleConfig';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, Filter, Shield, Lock, Users } from 'lucide-react';
import { MODULE_CATALOG, type ModuleId } from '@/lib/subscription-catalog';
import { getRoleModules } from './RoleModulePreview';
import type { Staff } from '@/hooks/useStaff';

// Role labels for display
const roleLabels: Record<string, string> = {
  teacher: 'Teacher',
  finance_officer: 'Finance Officer',
  accountant: 'Accountant',
  institution_admin: 'Admin',
  academic_director: 'Academic Dir.',
  hr_manager: 'HR Manager',
  ict_admin: 'ICT Admin',
  librarian: 'Librarian',
  institution_owner: 'Owner',
};

interface StaffPermissionsTabProps {
  staff: Staff[];
  staffRoles: Record<string, string>;
  institutionId: string;
}

export function StaffPermissionsTab({ staff, staffRoles, institutionId }: StaffPermissionsTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [savingCell, setSavingCell] = useState<string | null>(null);

  // Get enabled modules for this institution
  const { modules, isLoading: modulesLoading } = useModuleWithConfig(institutionId);
  
  const enabledModules = useMemo(() => {
    return (modules || []).filter(m => m.is_enabled);
  }, [modules]);

  // Staff with login accounts only
  const staffWithLogin = useMemo(() => {
    return staff.filter(s => s.user_id);
  }, [staff]);

  // Fetch all explicit module access for all staff
  const { data: allModuleAccess = [], isLoading: accessLoading } = useQuery({
    queryKey: ['all-staff-module-access', institutionId],
    queryFn: async () => {
      const userIds = staffWithLogin.map(s => s.user_id).filter(Boolean);
      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from('staff_module_access')
        .select('*')
        .eq('institution_id', institutionId)
        .in('user_id', userIds);

      if (error) {
        console.error('Error fetching module access:', error);
        return [];
      }

      return data;
    },
    enabled: !!institutionId && staffWithLogin.length > 0,
  });

  // Create a lookup map for explicit access
  const accessMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    allModuleAccess.forEach(access => {
      const key = access.user_id;
      if (!map.has(key)) {
        map.set(key, new Set());
      }
      // Only count if not expired
      if (!access.expires_at || new Date(access.expires_at) > new Date()) {
        map.get(key)!.add(access.module_id);
      }
    });
    return map;
  }, [allModuleAccess]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staffWithLogin.filter(s => {
      const matchesSearch = 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.employee_number?.toLowerCase().includes(search.toLowerCase());
      
      const role = staffRoles[s.user_id!];
      const matchesRole = roleFilter === 'all' || role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [staffWithLogin, search, roleFilter, staffRoles]);

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    return [...new Set(Object.values(staffRoles))];
  }, [staffRoles]);

  // Check if staff has access to module (from role or explicit)
  const hasAccess = (staffMember: Staff, moduleId: string): boolean => {
    const role = staffRoles[staffMember.user_id!];
    const roleModules = getRoleModules(role);
    const explicitModules = accessMap.get(staffMember.user_id!) || new Set();
    return roleModules.includes(moduleId) || explicitModules.has(moduleId);
  };

  // Check if access is from role (cannot be toggled off without changing role)
  const isFromRole = (staffMember: Staff, moduleId: string): boolean => {
    const role = staffRoles[staffMember.user_id!];
    const roleModules = getRoleModules(role);
    return roleModules.includes(moduleId);
  };

  // Check if module has explicit grant
  const hasExplicitGrant = (staffMember: Staff, moduleId: string): boolean => {
    const explicitModules = accessMap.get(staffMember.user_id!) || new Set();
    return explicitModules.has(moduleId);
  };

  // Toggle module access
  const handleToggle = async (staffMember: Staff, moduleId: string) => {
    const cellKey = `${staffMember.user_id}-${moduleId}`;
    setSavingCell(cellKey);

    try {
      const currentlyHasAccess = hasAccess(staffMember, moduleId);
      const fromRole = isFromRole(staffMember, moduleId);
      const hasExplicit = hasExplicitGrant(staffMember, moduleId);

      if (fromRole && !hasExplicit) {
        // Cannot remove role-based access
        toast.error('This access is from the staff role. Change the role to remove it.');
        return;
      }

      if (hasExplicit) {
        // Revoke explicit access
        const { error } = await supabase
          .from('staff_module_access')
          .delete()
          .eq('user_id', staffMember.user_id!)
          .eq('institution_id', institutionId)
          .eq('module_id', moduleId);

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user?.id,
          action: 'revoke_module_access',
          entity_type: 'staff_module_access',
          entity_id: staffMember.user_id,
          institution_id: institutionId,
          metadata: { module_id: moduleId, staff_name: `${staffMember.first_name} ${staffMember.last_name}` },
        });

        toast.success('Module access revoked');
      } else {
        // Grant explicit access
        const { error } = await supabase
          .from('staff_module_access')
          .upsert({
            user_id: staffMember.user_id!,
            institution_id: institutionId,
            module_id: moduleId,
            granted_by: user?.id,
          }, {
            onConflict: 'user_id,institution_id,module_id',
          });

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user?.id,
          action: 'grant_module_access',
          entity_type: 'staff_module_access',
          entity_id: staffMember.user_id,
          institution_id: institutionId,
          metadata: { module_id: moduleId, staff_name: `${staffMember.first_name} ${staffMember.last_name}` },
        });

        toast.success('Module access granted');
      }

      queryClient.invalidateQueries({ queryKey: ['all-staff-module-access', institutionId] });
    } catch (error: any) {
      console.error('Error toggling access:', error);
      toast.error('Failed to update access', { description: error.message });
    } finally {
      setSavingCell(null);
    }
  };

  const isLoading = modulesLoading || accessLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Permissions Matrix</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (staffWithLogin.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Staff Permissions Matrix
          </CardTitle>
          <CardDescription>
            Manage which modules each staff member can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No staff with login accounts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create login accounts for staff members to manage their module access
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Staff Permissions Matrix
            </CardTitle>
            <CardDescription>
              {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''} with login access
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:w-48"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role] || role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border bg-primary/20" />
            <span className="text-muted-foreground">Role-based (locked)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border bg-success/20" />
            <span className="text-muted-foreground">Explicitly granted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border" />
            <span className="text-muted-foreground">No access</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background min-w-[200px]">Staff Member</TableHead>
                <TableHead className="min-w-[100px]">Role</TableHead>
                {enabledModules.map((module) => {
                  const moduleInfo = MODULE_CATALOG[module.module_id as ModuleId];
                  return (
                    <TableHead key={module.module_id} className="text-center min-w-[80px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {moduleInfo?.label || module.module_id}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{moduleInfo?.description || module.module_id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staffMember) => {
                const role = staffRoles[staffMember.user_id!];
                return (
                  <TableRow key={staffMember.id}>
                    <TableCell className="sticky left-0 bg-background font-medium">
                      <div>
                        <p>{staffMember.first_name} {staffMember.last_name}</p>
                        <p className="text-xs text-muted-foreground">{staffMember.employee_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {roleLabels[role] || role || 'No role'}
                      </Badge>
                    </TableCell>
                    {enabledModules.map((module) => {
                      const moduleId = module.module_id;
                      const cellKey = `${staffMember.user_id}-${moduleId}`;
                      const access = hasAccess(staffMember, moduleId);
                      const fromRole = isFromRole(staffMember, moduleId);
                      const explicit = hasExplicitGrant(staffMember, moduleId);
                      const isSaving = savingCell === cellKey;

                      return (
                        <TableCell key={moduleId} className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  {fromRole ? (
                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20">
                                      <Lock className="h-3 w-3 text-primary" />
                                    </div>
                                  ) : (
                                    <Checkbox
                                      checked={access}
                                      onCheckedChange={() => handleToggle(staffMember, moduleId)}
                                      disabled={isSaving}
                                      className={explicit ? 'border-success bg-success/20 data-[state=checked]:bg-success data-[state=checked]:border-success' : ''}
                                    />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {fromRole 
                                  ? `Included with ${roleLabels[role] || role} role` 
                                  : explicit 
                                    ? 'Explicitly granted - click to revoke'
                                    : 'Click to grant access'
                                }
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
