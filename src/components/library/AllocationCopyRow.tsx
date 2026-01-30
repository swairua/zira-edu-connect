import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Undo2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import type { AllocationCopy } from '@/hooks/useTeacherAllocations';

interface AllocationCopyRowProps {
  copy: AllocationCopy;
  onReturn: (copyId: string) => void;
  onMarkLost: (copyId: string) => void;
  isReturning?: boolean;
  isMarkingLost?: boolean;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  allocated: 'outline',
  returned: 'secondary',
  lost: 'destructive',
};

const conditionLabels: Record<string, string> = {
  good: 'Good',
  fair: 'Fair',
  damaged: 'Damaged',
  lost: 'Lost',
};

export function AllocationCopyRow({
  copy,
  onReturn,
  onMarkLost,
  isReturning,
  isMarkingLost,
}: AllocationCopyRowProps) {
  const isActionable = copy.status === 'allocated';

  return (
    <TableRow className="bg-muted/30">
      <TableCell className="pl-10 font-mono text-sm">
        {copy.copy?.copy_number || 'Unknown'}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {copy.copy?.barcode || '-'}
      </TableCell>
      <TableCell>
        {copy.copy?.condition ? (
          <Badge variant="outline" className="text-xs">
            {conditionLabels[copy.copy.condition] || copy.copy.condition}
          </Badge>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <Badge variant={statusVariants[copy.status] || 'outline'}>
          {copy.status.charAt(0).toUpperCase() + copy.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {copy.returned_at ? format(new Date(copy.returned_at), 'MMM d, yyyy') : '-'}
      </TableCell>
      <TableCell>
        {copy.condition_at_return ? (
          <Badge variant="outline" className="text-xs">
            {conditionLabels[copy.condition_at_return] || copy.condition_at_return}
          </Badge>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="text-right">
        {isActionable && (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReturn(copy.id)}
              disabled={isReturning || isMarkingLost}
              title="Return this copy"
            >
              <Undo2 className="h-3.5 w-3.5 mr-1" />
              Return
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkLost(copy.id)}
              disabled={isReturning || isMarkingLost}
              className="text-destructive hover:text-destructive"
              title="Mark as lost"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Lost
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}