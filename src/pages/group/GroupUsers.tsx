import { useState } from 'react';
import { Users, Search, Plus, MoreVertical, Trash2, UserCog, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useGroup } from '@/contexts/GroupContext';
import { useInstitutionGroup } from '@/hooks/useInstitutionGroup';
import { GroupRole } from '@/types/group';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ROLE_LABELS: Record<GroupRole, string> = {
  group_owner: 'Group Owner',
  group_finance_admin: 'Finance Admin',
  group_academic_admin: 'Academic Admin',
  group_hr_admin: 'HR Admin',
  group_viewer: 'Viewer',
};

const ROLE_COLORS: Record<GroupRole, string> = {
  group_owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  group_finance_admin: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  group_academic_admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  group_hr_admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  group_viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function GroupUsers() {
  const { group, groupId, groupRole } = useGroup();
  const { removeUserFromGroup } = useInstitutionGroup(groupId ?? undefined);
  const [search, setSearch] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const canManageUsers = groupRole === 'group_owner';

  // Fetch group users with profile info
  const { data: groupUsers, isLoading } = useQuery({
    queryKey: ['group-users-list', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_user_roles')
        .select(`
          id,
          user_id,
          role,
          campus_access,
          granted_at
        `)
        .eq('group_id', groupId);
      
      if (error) throw error;

      // Fetch user profiles
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .in('user_id', userIds);

      // Merge data
      return data.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        return {
          ...role,
          email: profile?.email ?? 'Unknown',
          firstName: profile?.first_name ?? '',
          lastName: profile?.last_name ?? '',
        };
      });
    },
    enabled: !!groupId,
  });

  const filteredUsers = groupUsers?.filter(
    u => 
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleRemoveUser = async (roleId: string) => {
    if (confirm('Remove this user from the group?')) {
      await removeUserFromGroup.mutateAsync(roleId);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Group Users" subtitle="Loading...">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Group Users" 
      subtitle={`Manage users with access to ${group?.name ?? 'your group'}`}
    >
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {canManageUsers && (
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>
              Users with access to group-level functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.firstName?.[0] || user.email[0].toUpperCase()}
                        {user.lastName?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={ROLE_COLORS[user.role as GroupRole]}>
                      {ROLE_LABELS[user.role as GroupRole]}
                    </Badge>
                    {user.campus_access ? (
                      <Badge variant="outline">
                        {user.campus_access.length} campus{user.campus_access.length !== 1 ? 'es' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">All campuses</Badge>
                    )}
                    {canManageUsers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            <UserCog className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog - placeholder */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Group</DialogTitle>
            <DialogDescription>
              Invite a user to access group-level functions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input placeholder="user@example.com" className="mt-2" />
            </div>
            <div>
              <Label>Role</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled>
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
