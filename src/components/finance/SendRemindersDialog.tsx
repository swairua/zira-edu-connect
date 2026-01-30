import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Loader2, AlertCircle, Bell, AlertTriangle } from 'lucide-react';

interface SendRemindersDialogProps {
  institutionId?: string;
  selectedAccountIds?: string[];
  onSuccess?: () => void;
}

export function SendRemindersDialog({
  institutionId,
  selectedAccountIds,
  onSuccess,
}: SendRemindersDialogProps) {
  const [open, setOpen] = useState(false);
  const [reminderType, setReminderType] = useState<'gentle' | 'urgent' | 'final'>('gentle');
  const [sending, setSending] = useState(false);

  const reminderTypeConfig = {
    gentle: {
      label: 'Gentle Reminder',
      icon: Bell,
      description: 'A friendly reminder about the outstanding balance',
      color: 'text-blue-500',
    },
    urgent: {
      label: 'Urgent Notice',
      icon: AlertCircle,
      description: 'An urgent reminder with payment deadline',
      color: 'text-amber-500',
    },
    final: {
      label: 'Final Notice',
      icon: AlertTriangle,
      description: 'Final warning before action is taken',
      color: 'text-red-500',
    },
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-payment-reminder', {
        body: {
          institutionId,
          studentFeeAccountIds: selectedAccountIds,
          reminderType,
        },
      });

      if (error) throw error;

      toast.success(`Payment reminders sent`, {
        description: `${data.sent} reminders sent successfully${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
      });

      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send reminders', {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Send Reminders
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Payment Reminders</DialogTitle>
          <DialogDescription>
            Send email reminders to parents with outstanding fee balances.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reminder Type</Label>
            <Select value={reminderType} onValueChange={(v: any) => setReminderType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reminderTypeConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = reminderTypeConfig[reminderType].icon;
                return <Icon className={`h-5 w-5 mt-0.5 ${reminderTypeConfig[reminderType].color}`} />;
              })()}
              <div>
                <p className="font-medium">{reminderTypeConfig[reminderType].label}</p>
                <p className="text-sm text-muted-foreground">
                  {reminderTypeConfig[reminderType].description}
                </p>
              </div>
            </div>
          </div>

          {selectedAccountIds && selectedAccountIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Sending to {selectedAccountIds.length} selected account(s)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reminders
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
