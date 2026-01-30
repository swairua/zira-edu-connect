import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Save, 
  Trash2,
  Phone,
  Megaphone,
  X
} from 'lucide-react';
import { useInstitutionSmsSettings } from '@/hooks/useInstitutionSmsSettings';
import { Skeleton } from '@/components/ui/skeleton';
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
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export function InstitutionSmsSettingsCard() {
  const { institutionSettings, isLoading, upsertSettings, deleteSettings } = useInstitutionSmsSettings();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [transactionalId, setTransactionalId] = useState('');
  const [promotionalId, setPromotionalId] = useState('');

  // Fetch all institutions for dropdown
  const { data: institutions } = useQuery({
    queryKey: ['institutions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Filter out institutions that already have custom settings
  const availableInstitutions = institutions?.filter(
    inst => !institutionSettings.some(s => s.institution_id === inst.id)
  ) || [];

  const resetForm = () => {
    setSelectedInstitution('');
    setTransactionalId('');
    setPromotionalId('');
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (setting: typeof institutionSettings[0]) => {
    setSelectedInstitution(setting.institution_id);
    setTransactionalId(setting.transactional_sender_id || '');
    setPromotionalId(setting.promotional_sender_id || '');
    setEditingId(setting.id);
    setShowAddDialog(true);
  };

  const handleSave = () => {
    if (!selectedInstitution) return;
    
    upsertSettings.mutate({
      institution_id: selectedInstitution,
      transactional_sender_id: transactionalId.trim().toUpperCase(),
      promotional_sender_id: promotionalId.trim().toUpperCase(),
    }, {
      onSuccess: () => {
        setShowAddDialog(false);
        resetForm();
      }
    });
  };

  const handleDelete = () => {
    if (!deleteConfirmId) return;
    const setting = institutionSettings.find(s => s.id === deleteConfirmId);
    if (setting) {
      deleteSettings.mutate(setting.institution_id, {
        onSuccess: () => setDeleteConfirmId(null)
      });
    }
  };

  const currentInstitutionName = editingId 
    ? institutionSettings.find(s => s.id === editingId)?.institution_name
    : institutions?.find(i => i.id === selectedInstitution)?.name;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle>Institution Custom Sender IDs</CardTitle>
            </div>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add Custom
            </Button>
          </div>
          <CardDescription>
            Override platform defaults for specific institutions (e.g., Kahawa can use "KAHAWA-SMS")
          </CardDescription>
        </CardHeader>
        <CardContent>
          {institutionSettings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No custom sender IDs configured</p>
              <p className="text-sm">All institutions are using platform defaults</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Transactional</TableHead>
                  <TableHead>Promotional</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutionSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.institution_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{setting.transactional_sender_id || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{setting.promotional_sender_id || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(setting)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirmId(setting.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Custom Sender IDs' : 'Add Custom Sender IDs'}
            </DialogTitle>
            <DialogDescription>
              Configure custom sender IDs for a specific institution
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Institution Selector */}
            <div className="space-y-2">
              <Label>Institution</Label>
              {editingId ? (
                <div className="p-2 rounded bg-muted text-sm font-medium">
                  {currentInstitutionName}
                </div>
              ) : (
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInstitutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Transactional Sender ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Label>Transactional Sender ID</Label>
              </div>
              <Input
                value={transactionalId}
                onChange={(e) => setTransactionalId(e.target.value.slice(0, 11))}
                placeholder="e.g., KAHAWA-OTP"
                maxLength={11}
                className="uppercase"
              />
            </div>

            {/* Promotional Sender ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-muted-foreground" />
                <Label>Promotional Sender ID</Label>
              </div>
              <Input
                value={promotionalId}
                onChange={(e) => setPromotionalId(e.target.value.slice(0, 11))}
                placeholder="e.g., KAHAWA-SMS"
                maxLength={11}
                className="uppercase"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!selectedInstitution || upsertSettings.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {upsertSettings.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Custom Sender IDs?</AlertDialogTitle>
            <AlertDialogDescription>
              This institution will revert to using platform default sender IDs for all SMS messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remove Custom IDs
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
