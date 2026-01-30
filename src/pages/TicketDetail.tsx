import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketPriorityBadge } from '@/components/tickets/TicketPriorityBadge';
import { TicketResponseList } from '@/components/tickets/TicketResponseList';
import { TicketResponseForm } from '@/components/tickets/TicketResponseForm';
import { AssignTicketDialog } from '@/components/tickets/AssignTicketDialog';
import {
  useTicketDetail,
  useTicketResponses,
  useUpdateTicketStatus,
} from '@/hooks/useSupportTickets';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin, isSupportAdmin } = useAuth();
  const isStaff = isSuperAdmin || isSupportAdmin;

  const { data: ticket, isLoading: ticketLoading } = useTicketDetail(id);
  const { data: responses = [], isLoading: responsesLoading } = useTicketResponses(id);
  const { mutate: updateStatus, isPending: statusUpdating } = useUpdateTicketStatus();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Subscribe to realtime updates for responses
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`ticket-responses-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_responses',
          filter: `ticket_id=eq.${id}`,
        },
        () => {
          // Refetch will happen via query invalidation
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (ticketLoading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout title="Ticket Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Ticket not found</h2>
          <Button variant="link" onClick={() => navigate('/tickets')}>
            Back to tickets
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <DashboardLayout title={ticket.ticket_number}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              onClick={() => navigate('/tickets')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tickets
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{ticket.ticket_number}</h1>
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="text-lg text-muted-foreground mt-1">{ticket.subject}</h2>
          </div>

          {isStaff && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {ticket.assigned_to ? 'Reassign' : 'Assign'}
              </Button>

              <Select
                value={ticket.status}
                onValueChange={(value) =>
                  updateStatus({ ticketId: ticket.id, status: value })
                }
                disabled={statusUpdating}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created By</p>
                <p className="font-medium">{ticket.created_by_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Institution</p>
                <p className="font-medium">{ticket.institution?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned To</p>
                <p className="font-medium">
                  {ticket.assigned_profile
                    ? `${ticket.assigned_profile.first_name || ''} ${ticket.assigned_profile.last_name || ''}`.trim() ||
                      ticket.assigned_profile.email
                    : 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-muted-foreground text-sm mb-2">Description</p>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Conversation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TicketResponseList
              responses={responses}
              isLoading={responsesLoading}
            />

            {!isClosed && (
              <div className="pt-4 border-t">
                <TicketResponseForm ticketId={ticket.id} />
              </div>
            )}

            {isClosed && (
              <div className="text-center py-4 text-muted-foreground bg-muted rounded-lg">
                This ticket is {ticket.status}. No more responses can be added.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignTicketDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        ticketId={ticket.id}
        currentAssignee={ticket.assigned_to}
      />
    </DashboardLayout>
  );
}
