import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
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
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAssignTicket } from '@/hooks/useSupportTickets';

interface AssignTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  currentAssignee?: string | null;
}

export function AssignTicketDialog({
  open,
  onOpenChange,
  ticketId,
  currentAssignee,
}: AssignTicketDialogProps) {
  const [selectedUser, setSelectedUser] = useState<string>(currentAssignee || '');
  const { mutate: assignTicket, isPending } = useAssignTicket();

  // Fetch support staff (super admins and support admins)
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['support-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles:user_id(first_name, last_name, email)
        `)
        .in('role', ['super_admin', 'support_admin']);

      if (error) throw error;

      // Dedupe by user_id
      const uniqueUsers = new Map();
      data?.forEach((item: any) => {
        if (item.profiles && !uniqueUsers.has(item.user_id)) {
          uniqueUsers.set(item.user_id, {
            id: item.user_id,
            name: `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || item.profiles.email,
            email: item.profiles.email,
          });
        }
      });

      return Array.from(uniqueUsers.values());
    },
    enabled: open,
  });

  const handleAssign = () => {
    assignTicket(
      { ticketId, userId: selectedUser || null },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? 'Loading...' : 'Select staff member'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={isPending}>
              {isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
