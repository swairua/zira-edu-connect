import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInstitutionUsers } from '@/hooks/useInstitutionUsers';
import { InviteUserForm } from './InviteUserForm';
import { UserPlus, Users, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Institution = Tables<'institutions'>;

interface InstitutionUsersDialogProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roleLabels: Record<string, string> = {
  institution_owner: 'Owner',
  institution_admin: 'Admin',
  finance_officer: 'Finance Officer',
  academic_director: 'Academic Director',
  teacher: 'Teacher',
  ict_admin: 'ICT Admin',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
};

const roleColors: Record<string, string> = {
  institution_owner: 'bg-primary/10 text-primary',
  institution_admin: 'bg-secondary/10 text-secondary',
  finance_officer: 'bg-info/10 text-info',
  academic_director: 'bg-warning/10 text-warning',
  teacher: 'bg-muted text-muted-foreground',
  ict_admin: 'bg-accent/10 text-accent-foreground',
  hr_manager: 'bg-success/10 text-success',
  accountant: 'bg-info/10 text-info',
};

export function InstitutionUsersDialog({ 
  institution, 
  open, 
  onOpenChange 
}: InstitutionUsersDialogProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const { users, isLoading, removeUser, isRemoving } = useInstitutionUsers(institution?.id || null);

  const handleInviteSuccess = () => {
    setShowInviteForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Users - {institution?.name}
          </DialogTitle>
          <DialogDescription>
            Add, remove, or manage user access for this institution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showInviteForm ? (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setShowInviteForm(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Users className="h-8 w-8 mb-2" />
                    <p>No users assigned to this institution</p>
                    <p className="text-sm">Click "Add User" to invite someone</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role] || 'bg-muted text-muted-foreground'}`}>
                              {roleLabels[user.role] || user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'success' : 'secondary'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(user.grantedAt), 'MMM d, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" disabled={isRemoving}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => removeUser(user.userId)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove from Institution
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </>
          ) : (
            <InviteUserForm 
              institutionId={institution?.id || ''} 
              onSuccess={handleInviteSuccess}
              onCancel={() => setShowInviteForm(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
