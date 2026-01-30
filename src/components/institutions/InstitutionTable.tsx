import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { institutionTypeLabels, countryOptions } from '@/types/database';
import type { Tables } from '@/integrations/supabase/types';
import { InstitutionUsersDialog } from './InstitutionUsersDialog';
import { CreateGroupDialog } from '@/components/group/CreateGroupDialog';
import { AddToGroupDialog } from '@/components/group/AddToGroupDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Institution = Tables<'institutions'>;
import { MoreHorizontal, Eye, Edit, Ban, Trash2, Building2, Users, UserCog, RefreshCw, UserPlus, Network, Plus, Loader2, CheckCircle, Landmark, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface InstitutionTableProps {
  institutions: Institution[];
  onLifecycleClick?: (institution: Institution) => void;
  onEditClick?: (institution: Institution) => void;
}

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'secondary'> = {
  active: 'success',
  pending: 'warning',
  trial: 'info',
  suspended: 'destructive',
  churned: 'secondary',
  expired: 'destructive',
};

const planColors: Record<string, string> = {
  starter: 'bg-muted text-muted-foreground',
  professional: 'bg-primary/10 text-primary',
  enterprise: 'bg-secondary/10 text-secondary',
  custom: 'bg-info/10 text-info',
};

export function InstitutionTable({ institutions, onLifecycleClick, onEditClick }: InstitutionTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [addToGroupDialogOpen, setAddToGroupDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionInstitution, setActionInstitution] = useState<Institution | null>(null);

  // Fetch groups for display
  const { data: groups = [] } = useQuery({
    queryKey: ['institution-groups-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institution_groups')
        .select('id, name, code');
      if (error) throw error;
      return data;
    },
  });

  // Suspend/Reactivate mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      const { error } = await supabase
        .from('institutions')
        .update({ status: suspend ? 'suspended' : 'active' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast({
        title: variables.suspend ? 'Institution Suspended' : 'Institution Reactivated',
        description: `The institution has been ${variables.suspend ? 'suspended' : 'reactivated'} successfully.`,
      });
      setSuspendDialogOpen(false);
      setActionInstitution(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update institution status.',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('institutions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      toast({
        title: 'Institution Deleted',
        description: 'The institution has been permanently deleted.',
      });
      setDeleteDialogOpen(false);
      setActionInstitution(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete institution. It may have linked data.',
        variant: 'destructive',
      });
    },
  });

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return null;
    return groups.find(g => g.id === groupId)?.name ?? null;
  };

  const handleManageUsers = (institution: Institution) => {
    setSelectedInstitution(institution);
    setUsersDialogOpen(true);
  };

  const handleCreateGroup = (institution: Institution) => {
    setSelectedInstitution(institution);
    setCreateGroupDialogOpen(true);
  };

  const handleAddToGroup = (institution: Institution) => {
    setSelectedInstitution(institution);
    setAddToGroupDialogOpen(true);
  };

  const handleViewDetails = (institution: Institution) => {
    // Navigate to institution detail page (or onboarding if pending)
    if (institution.status === 'pending' || institution.onboarding_status !== 'completed') {
      navigate(`/onboarding?institution=${institution.id}`);
    } else {
      navigate(`/institution-dashboard?id=${institution.id}`);
    }
  };

  const handleEdit = (institution: Institution) => {
    if (onEditClick) {
      onEditClick(institution);
    } else {
      // Fallback: navigate to edit page
      navigate(`/institutions/edit/${institution.id}`);
    }
  };

  const handleSuspendClick = (institution: Institution) => {
    setActionInstitution(institution);
    setSuspendDialogOpen(true);
  };

  const handleDeleteClick = (institution: Institution) => {
    setActionInstitution(institution);
    setDeleteDialogOpen(true);
  };

  const getCountryFlag = (code: string) => {
    return countryOptions.find((c) => c.value === code)?.flag || '🌍';
  };

  return (
    <>
      <div className="rounded-lg border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Institution</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Ownership</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Staff</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {institutions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="h-8 w-8" />
                    <p>No institutions found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              institutions.map((institution) => (
                <TableRow key={institution.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-105">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{institution.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{institution.code}</p>
                          {institution.group_id && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs py-0 h-5 max-w-[140px] cursor-default">
                                  <Network className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{getGroupName(institution.group_id) || 'Group'}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getGroupName(institution.group_id)}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{institutionTypeLabels[institution.type]}</span>
                  </TableCell>
                  <TableCell>
                    {institution.ownership_type === 'public' ? (
                      <Badge variant="info" className="gap-1">
                        <Landmark className="h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">{getCountryFlag(institution.country)}</span>
                      <span className="text-sm">{institution.country}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[institution.status]}>
                      {institution.status.charAt(0).toUpperCase() + institution.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${planColors[institution.subscription_plan]}`}>
                      {institution.subscription_plan.charAt(0).toUpperCase() + institution.subscription_plan.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{institution.student_count.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{institution.staff_count.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(institution.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(institution)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(institution)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageUsers(institution)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Manage Users
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/institutions/${institution.id}/modules`)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          Manage Modules
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onLifecycleClick?.(institution)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Change Status
                        </DropdownMenuItem>
                        
                        {/* Group Management Actions */}
                        {!institution.group_id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              Multi-Campus
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleAddToGroup(institution)}>
                              <Network className="mr-2 h-4 w-4" />
                              Add to Existing Group
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateGroup(institution)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Create Group from This
                            </DropdownMenuItem>
                          </>
                        )}
                        {institution.group_id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to="/group/campuses">
                                <Network className="mr-2 h-4 w-4" />
                                View Group Campuses
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-warning"
                          onClick={() => handleSuspendClick(institution)}
                        >
                          {institution.status === 'suspended' ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Reactivate
                            </>
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteClick(institution)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InstitutionUsersDialog
        institution={selectedInstitution}
        open={usersDialogOpen}
        onOpenChange={setUsersDialogOpen}
      />

      <CreateGroupDialog
        open={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
        initialInstitutionId={selectedInstitution?.id}
        initialInstitutionName={selectedInstitution?.name}
      />

      <AddToGroupDialog
        open={addToGroupDialogOpen}
        onOpenChange={setAddToGroupDialogOpen}
        institution={selectedInstitution}
      />

      {/* Suspend/Reactivate Confirmation Dialog */}
      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionInstitution?.status === 'suspended' ? 'Reactivate Institution' : 'Suspend Institution'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionInstitution?.status === 'suspended' 
                ? `Are you sure you want to reactivate "${actionInstitution?.name}"? Users will regain access to the system.`
                : `Are you sure you want to suspend "${actionInstitution?.name}"? Users will lose access until reactivated.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspendMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionInstitution && suspendMutation.mutate({
                id: actionInstitution.id,
                suspend: actionInstitution.status !== 'suspended'
              })}
              disabled={suspendMutation.isPending}
              className={actionInstitution?.status === 'suspended' ? '' : 'bg-warning text-warning-foreground hover:bg-warning/90'}
            >
              {suspendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionInstitution?.status === 'suspended' ? 'Reactivate' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Institution</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{actionInstitution?.name}"? 
              This action cannot be undone and will remove all associated data including students, staff, and financial records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionInstitution && deleteMutation.mutate(actionInstitution.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
