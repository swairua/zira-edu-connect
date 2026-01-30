import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  HardDrive, 
  Download, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileJson,
  Calendar
} from 'lucide-react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useBackupHistory, 
  useCreateBackup, 
  useDeleteBackup,
  useRefreshDownloadUrl,
  BackupHistory
} from '@/hooks/useBackups';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BACKUP_MODULES = [
  { id: 'students', label: 'Students', description: 'Student records and profiles' },
  { id: 'staff', label: 'Staff', description: 'Staff records and employment data' },
  { id: 'parents', label: 'Parents', description: 'Parent/guardian information' },
  { id: 'classes', label: 'Classes', description: 'Class structure and assignments' },
  { id: 'subjects', label: 'Subjects', description: 'Subject configurations' },
  { id: 'attendance', label: 'Attendance', description: 'Attendance records (last 10,000)' },
  { id: 'finance', label: 'Finance', description: 'Invoices, payments, and fee items' },
  { id: 'grades', label: 'Grades', description: 'Exam results and assessments' },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function BackupStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
    case 'processing':
      return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
    case 'failed':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    default:
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  }
}

function BackupRow({ 
  backup, 
  onDelete, 
  onRefreshUrl,
  isDeleting,
  isRefreshing 
}: { 
  backup: BackupHistory;
  onDelete: () => void;
  onRefreshUrl: () => void;
  isDeleting: boolean;
  isRefreshing: boolean;
}) {
  const isExpired = backup.download_expires_at && isPast(new Date(backup.download_expires_at));
  const canDownload = backup.status === 'completed' && backup.download_url && !isExpired;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileJson className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{backup.file_name || 'Backup'}</span>
            <BackupStatusBadge status={backup.status} />
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {format(new Date(backup.created_at), 'PPp')}
            <span className="text-xs">({formatDistanceToNow(new Date(backup.created_at), { addSuffix: true })})</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Size: {formatFileSize(backup.file_size_bytes)} • 
            Modules: {backup.include_modules.join(', ')}
          </div>
          {backup.error_message && (
            <div className="text-xs text-destructive mt-1">{backup.error_message}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {backup.status === 'completed' && (
          <>
            {canDownload ? (
              <Button variant="outline" size="sm" asChild>
                <a href={backup.download_url!} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </a>
              </Button>
            ) : isExpired ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefreshUrl}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Refresh Link
              </Button>
            ) : null}
          </>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-destructive" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Backup</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this backup file. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function BackupSettings() {
  const { institution } = useInstitution();
  const [selectedModules, setSelectedModules] = useState<string[]>(['all']);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const { data: backups, isLoading } = useBackupHistory(institution?.id);
  const createBackup = useCreateBackup();
  const deleteBackup = useDeleteBackup();
  const refreshUrl = useRefreshDownloadUrl();

  const handleModuleToggle = (moduleId: string) => {
    if (moduleId === 'all') {
      setSelectedModules(['all']);
    } else {
      setSelectedModules(prev => {
        const newModules = prev.filter(m => m !== 'all');
        if (newModules.includes(moduleId)) {
          return newModules.filter(m => m !== moduleId);
        }
        return [...newModules, moduleId];
      });
    }
  };

  const handleCreateBackup = () => {
    if (!institution?.id) return;
    createBackup.mutate({
      institutionId: institution.id,
      includeModules: selectedModules,
    });
  };

  const handleDelete = async (backup: BackupHistory) => {
    setDeletingId(backup.id);
    try {
      await deleteBackup.mutateAsync({
        backupId: backup.id,
        filePath: backup.file_path,
        institutionId: backup.institution_id,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleRefreshUrl = async (backup: BackupHistory) => {
    if (!backup.file_path) return;
    setRefreshingId(backup.id);
    try {
      await refreshUrl.mutateAsync({
        backupId: backup.id,
        filePath: backup.file_path,
        institutionId: backup.institution_id,
      });
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <DashboardLayout title="Data Backup" subtitle="Create and manage backups of your institution's data">
      <div className="space-y-6">
        {/* Create Backup Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Create New Backup</CardTitle>
                <CardDescription>
                  Export your data as a JSON file for safekeeping
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Select data to include:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox 
                    id="all" 
                    checked={selectedModules.includes('all')}
                    onCheckedChange={() => handleModuleToggle('all')}
                  />
                  <Label htmlFor="all" className="cursor-pointer">
                    <span className="font-medium">All Data</span>
                    <p className="text-xs text-muted-foreground">Complete backup</p>
                  </Label>
                </div>
                {BACKUP_MODULES.map(module => (
                  <div key={module.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox 
                      id={module.id} 
                      checked={selectedModules.includes('all') || selectedModules.includes(module.id)}
                      disabled={selectedModules.includes('all')}
                      onCheckedChange={() => handleModuleToggle(module.id)}
                    />
                    <Label htmlFor={module.id} className="cursor-pointer">
                      <span className="font-medium">{module.label}</span>
                      <p className="text-xs text-muted-foreground">{module.description}</p>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleCreateBackup} 
              disabled={createBackup.isPending || selectedModules.length === 0}
              className="w-full sm:w-auto"
            >
              {createBackup.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 mr-2" />
                  Create Backup Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Backup History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>
              Download links expire after 24 hours. Click "Refresh Link" to generate a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : !backups || backups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <HardDrive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No backups yet</p>
                <p className="text-sm">Create your first backup above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map(backup => (
                  <BackupRow 
                    key={backup.id} 
                    backup={backup}
                    onDelete={() => handleDelete(backup)}
                    onRefreshUrl={() => handleRefreshUrl(backup)}
                    isDeleting={deletingId === backup.id}
                    isRefreshing={refreshingId === backup.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}