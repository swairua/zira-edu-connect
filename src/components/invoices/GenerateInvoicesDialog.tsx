import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useCurrentAcademicYear } from '@/hooks/useAcademicYears';
import { useClasses } from '@/hooks/useClasses';
import { useFeeItems } from '@/hooks/useFeeItems';
import { useStudents } from '@/hooks/useStudents';
import { useBulkGenerateInvoices } from '@/hooks/useInvoices';
import { FileText, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface GenerateInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateInvoicesDialog({ open, onOpenChange }: GenerateInvoicesDialogProps) {
  const { institutionId } = useInstitution();
  const { data: currentYear } = useCurrentAcademicYear(institutionId);
  const { data: classes = [] } = useClasses(institutionId);
  const { data: feeItems = [] } = useFeeItems(institutionId);
  const bulkGenerate = useBulkGenerateInvoices();

  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedFeeItems, setSelectedFeeItems] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));

  const currentTerms = currentYear?.terms || [];

  const { data: students = [] } = useStudents(institutionId, {
    classId: selectedClassId !== 'all' ? selectedClassId : undefined,
    status: 'active',
  });

  const activeFeeItems = feeItems.filter((item) => item.is_active);

  const toggleFeeItem = (itemId: string) => {
    const newSelected = new Set(selectedFeeItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedFeeItems(newSelected);
  };

  const selectAllFeeItems = () => {
    if (selectedFeeItems.size === activeFeeItems.length) {
      setSelectedFeeItems(new Set());
    } else {
      setSelectedFeeItems(new Set(activeFeeItems.map((item) => item.id)));
    }
  };

  const totalAmount = activeFeeItems
    .filter((item) => selectedFeeItems.has(item.id))
    .reduce((sum, item) => sum + item.amount, 0);

  const handleGenerate = async () => {
    if (!institutionId || selectedFeeItems.size === 0 || students.length === 0) return;

    const selectedItems = activeFeeItems.filter((item) => selectedFeeItems.has(item.id));

    await bulkGenerate.mutateAsync({
      institutionId,
      studentIds: students.map((s) => s.id),
      feeItems: selectedItems,
      termId: selectedTermId || undefined,
      academicYearId: currentYear?.id,
      dueDate,
    });

    onOpenChange(false);
    setSelectedFeeItems(new Set());
    setSelectedClassId('all');
    setSelectedTermId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Invoices</DialogTitle>
          <DialogDescription>
            Create invoices for multiple students at once
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="grid gap-4">
            {/* Term Selection */}
            <div className="grid gap-2">
              <Label>Term</Label>
              <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {currentTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name} {term.is_current && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Selection */}
            <div className="grid gap-2">
              <Label>Students</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {students.length} student{students.length !== 1 ? 's' : ''} will receive invoices
              </p>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Fee Items Selection */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Fee Items</Label>
                <Button variant="link" size="sm" onClick={selectAllFeeItems} className="h-auto p-0">
                  {selectedFeeItems.size === activeFeeItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {activeFeeItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No fee items configured</p>
                ) : (
                  activeFeeItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-md p-2 hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedFeeItems.has(item.id)}
                          onCheckedChange={() => toggleFeeItem(item.id)}
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category || 'General'}</p>
                        </div>
                      </div>
                      <span className="font-medium">KES {item.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">Invoice Summary</span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students:</span>
                  <span>{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Items:</span>
                  <span>{selectedFeeItems.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount per Student:</span>
                  <span className="font-medium">KES {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-medium">Total to Invoice:</span>
                  <span className="font-bold text-primary">
                    KES {(totalAmount * students.length).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {students.length === 0 && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                No students found. Select a class with active students.
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={
              bulkGenerate.isPending ||
              selectedFeeItems.size === 0 ||
              students.length === 0
            }
          >
            {bulkGenerate.isPending
              ? 'Generating...'
              : `Generate ${students.length} Invoice${students.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
