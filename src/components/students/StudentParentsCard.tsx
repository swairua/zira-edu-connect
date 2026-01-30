import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useStudentParents, useUnlinkParent, useSendParentInvite } from '@/hooks/useStudentParents';
import { AddParentDialog } from './AddParentDialog';
import { 
  UserPlus, 
  MoreVertical, 
  Phone, 
  Mail, 
  Send, 
  Unlink,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface StudentParentsCardProps {
  studentId: string;
  studentName: string;
  institutionId: string;
}

export function StudentParentsCard({ 
  studentId, 
  studentName,
  institutionId,
}: StudentParentsCardProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [unlinkParentId, setUnlinkParentId] = useState<string | null>(null);

  const { data: parents = [], isLoading } = useStudentParents(studentId);
  const unlinkParent = useUnlinkParent();
  const sendInvite = useSendParentInvite();

  const handleUnlink = async () => {
    if (!unlinkParentId) return;
    await unlinkParent.mutateAsync({ linkId: unlinkParentId, studentId });
    setUnlinkParentId(null);
  };

  const handleSendInvite = async (parentId: string) => {
    await sendInvite.mutateAsync({ parentId, studentId, institutionId });
  };

  const parentToUnlink = parents.find(p => p.id === unlinkParentId);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Parents / Guardians
            </CardTitle>
            <CardDescription>
              {parents.length} parent(s) linked to this student
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Parent
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : parents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-sm font-medium">No parents linked</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a parent or guardian to enable portal access
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowAddDialog(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add First Parent
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {parents.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {link.parent.first_name} {link.parent.last_name}
                      </span>
                      <Badge variant="outline" className="capitalize">
                        {link.relationship}
                      </Badge>
                      {link.is_primary && (
                        <Badge variant="secondary">Primary</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {link.parent.phone}
                      </span>
                      {link.parent.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {link.parent.email}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      {link.parent.user_id ? (
                        <Badge className="gap-1 bg-success/10 text-success hover:bg-success/20">
                          <CheckCircle className="h-3 w-3" />
                          Portal Access Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          No Portal Access
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!link.parent.user_id && link.parent.email && (
                        <DropdownMenuItem
                          onClick={() => handleSendInvite(link.parent.id)}
                          disabled={sendInvite.isPending}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Portal Invite
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setUnlinkParentId(link.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        Unlink Parent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddParentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        studentId={studentId}
        studentName={studentName}
        institutionId={institutionId}
      />

      <AlertDialog open={!!unlinkParentId} onOpenChange={() => setUnlinkParentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Parent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {parentToUnlink?.parent.first_name} {parentToUnlink?.parent.last_name} as 
              a linked parent for {studentName}. The parent record will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unlinkParent.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Unlink
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
