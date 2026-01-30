import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MarkLostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  copyNumber: string;
  onConfirm: (notes: string) => void;
  isPending?: boolean;
}

export function MarkLostDialog({
  open,
  onOpenChange,
  copyNumber,
  onConfirm,
  isPending,
}: MarkLostDialogProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNotes('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark Book as Lost</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark <span className="font-medium">{copyNumber}</span> as lost. This action
            affects inventory tracking and cannot be easily undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="lost-notes">Notes (Optional)</Label>
          <Textarea
            id="lost-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the circumstances..."
            rows={3}
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Processing...' : 'Mark as Lost'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}