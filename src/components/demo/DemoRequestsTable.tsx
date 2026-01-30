import { useState } from 'react';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Phone, Mail, Building2, MessageSquare, CheckCircle2, Trash2, Plus } from 'lucide-react';
import type { DemoRequest } from '@/hooks/useDemoRequests';
import { useNavigate } from 'react-router-dom';

interface DemoRequestsTableProps {
  requests: DemoRequest[];
  onUpdateStatus: (params: { id: string; status: string; notes?: string }) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  contacted: { label: 'Contacted', variant: 'default' },
  converted: { label: 'Converted', variant: 'outline' },
  declined: { label: 'Declined', variant: 'destructive' },
};

export function DemoRequestsTable({ requests, onUpdateStatus, onDelete, isUpdating }: DemoRequestsTableProps) {
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; request: DemoRequest | null }>({ open: false, request: null });
  const [notes, setNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddNotes = () => {
    if (notesDialog.request) {
      onUpdateStatus({ id: notesDialog.request.id, status: notesDialog.request.status, notes });
      setNotesDialog({ open: false, request: null });
      setNotes('');
    }
  };

  const handleCreateInstitution = (request: DemoRequest) => {
    // Navigate to add institution with pre-filled data
    navigate(`/institutions/new?from_demo=${request.id}&name=${encodeURIComponent(request.school_name)}&email=${encodeURIComponent(request.email)}&phone=${encodeURIComponent(request.phone)}`);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No demo requests yet</p>
        <p className="text-sm">Requests from the landing page will appear here</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(request.created_at), 'MMM d, yyyy')}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(request.created_at), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{request.name}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${request.email}`} className="hover:underline">{request.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <a href={`tel:${request.phone}`} className="hover:underline">{request.phone}</a>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {request.school_name}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig[request.status]?.variant || 'secondary'}>
                  {statusConfig[request.status]?.label || request.status}
                </Badge>
                {request.contacted_at && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(request.contacted_at), 'MMM d')}
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {request.notes || <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isUpdating}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdateStatus({ id: request.id, status: 'contacted' })}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Contacted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setNotesDialog({ open: true, request });
                      setNotes(request.notes || '');
                    }}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Notes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCreateInstitution(request)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Institution
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(request.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Notes Dialog */}
      <Dialog open={notesDialog.open} onOpenChange={(open) => setNotesDialog({ open, request: notesDialog.request })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription>
              Add notes for {notesDialog.request?.name} from {notesDialog.request?.school_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter follow-up notes..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialog({ open: false, request: null })}>
              Cancel
            </Button>
            <Button onClick={handleAddNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this demo request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deleteConfirm) {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
