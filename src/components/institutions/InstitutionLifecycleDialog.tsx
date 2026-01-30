import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import { AlertCircle, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

type Institution = Tables<'institutions'>;
type InstitutionStatus = Institution['status'];

interface InstitutionLifecycleDialogProps {
  institution: Institution | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusTransitions: Record<InstitutionStatus, InstitutionStatus[]> = {
  pending: ['trial', 'active', 'suspended'],
  trial: ['active', 'expired', 'suspended'],
  active: ['suspended', 'churned'],
  suspended: ['active', 'churned'],
  expired: ['active', 'churned'],
  churned: ['pending'], // Can be re-onboarded
};

const statusConfig: Record<InstitutionStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-warning' },
  trial: { label: 'Trial', icon: Clock, color: 'text-info' },
  active: { label: 'Active', icon: CheckCircle2, color: 'text-success' },
  suspended: { label: 'Suspended', icon: XCircle, color: 'text-destructive' },
  expired: { label: 'Expired', icon: AlertCircle, color: 'text-destructive' },
  churned: { label: 'Churned', icon: XCircle, color: 'text-muted-foreground' },
};

const churnReasons = [
  'Price too high',
  'Switched to competitor',
  'No longer needed',
  'Poor customer support',
  'Missing features',
  'Technical issues',
  'School closed',
  'Other',
];

export function InstitutionLifecycleDialog({
  institution,
  open,
  onOpenChange,
}: InstitutionLifecycleDialogProps) {
  const [newStatus, setNewStatus] = useState<InstitutionStatus | ''>('');
  const [churnReason, setChurnReason] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!institution || !newStatus) return;

      const updateData: Partial<Institution> = {
        status: newStatus,
      };

      // Set subscription dates based on transition
      if (newStatus === 'active' && institution.status !== 'active') {
        updateData.subscription_started_at = new Date().toISOString();
      }

      if (newStatus === 'churned') {
        updateData.churn_reason = churnReason || notes || null;
      }

      const { error } = await supabase
        .from('institutions')
        .update(updateData)
        .eq('id', institution.id);

      if (error) throw error;

      // Log the status change
      await supabase.from('audit_logs').insert({
        action: 'status_change',
        entity_type: 'institution',
        entity_id: institution.id,
        metadata: {
          from_status: institution.status,
          to_status: newStatus,
          reason: churnReason || notes || null,
        },
      });
    },
    onSuccess: () => {
      toast.success('Institution status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const resetForm = () => {
    setNewStatus('');
    setChurnReason('');
    setNotes('');
  };

  if (!institution) return null;

  const availableTransitions = statusTransitions[institution.status] || [];
  const currentConfig = statusConfig[institution.status];
  const CurrentIcon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Change Institution Status</DialogTitle>
          <DialogDescription>
            Update the lifecycle status for <strong>{institution.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-4">
          <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <CurrentIcon className={`h-5 w-5 ${currentConfig.color}`} />
            <div>
              <p className="text-sm text-muted-foreground">Current Status</p>
              <p className="font-medium">{currentConfig.label}</p>
            </div>
          </div>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as InstitutionStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableTransitions.map((status) => {
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  return (
                    <SelectItem key={status} value={status}>
                      <span className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Churn Reason (only for churned status) */}
          {newStatus === 'churned' && (
            <div className="space-y-2">
              <Label>Churn Reason</Label>
              <Select value={churnReason} onValueChange={setChurnReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {churnReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add any additional notes about this status change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => updateStatusMutation.mutate()}
            disabled={!newStatus || updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
