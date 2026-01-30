import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeacherAllocations, type TeacherAllocation } from '@/hooks/useTeacherAllocations';
import { useLibraryBooks, useLibraryBookCopies } from '@/hooks/useLibraryBooks';
import { useStaff } from '@/hooks/useStaff';
import { useClasses } from '@/hooks/useClasses';
import { useInstitution } from '@/contexts/InstitutionContext';
import { AllocationCopyRow } from '@/components/library/AllocationCopyRow';
import { ReturnCopyDialog } from '@/components/library/ReturnCopyDialog';
import { MarkLostDialog } from '@/components/library/MarkLostDialog';
import { Plus, Search, Undo2, Package, BookCopy, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function TeacherAllocations() {
  const { institutionId } = useInstitution();
  const { 
    allocations, 
    isLoading, 
    allocateToTeacher, 
    returnFromTeacher,
    returnIndividualCopy,
    markCopyAsLost,
  } = useTeacherAllocations();
  const { books } = useLibraryBooks();
  const { data: staffData } = useStaff(institutionId);
  const { data: classesData } = useClasses(institutionId);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [expandedAllocations, setExpandedAllocations] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    bookId: '',
    teacherId: '',
    classId: '',
    notes: '',
  });
  const [selectedCopyIds, setSelectedCopyIds] = useState<string[]>([]);

  // Return dialog state
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnCopyId, setReturnCopyId] = useState<string | null>(null);
  const [returnCopyNumber, setReturnCopyNumber] = useState('');

  // Lost dialog state
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostCopyId, setLostCopyId] = useState<string | null>(null);
  const [lostCopyNumber, setLostCopyNumber] = useState('');

  // Fetch copies for the selected book
  const { copies: bookCopies, isLoading: copiesLoading } = useLibraryBookCopies(formData.bookId || undefined);
  
  // Filter to only available copies
  const availableCopies = useMemo(() => 
    bookCopies.filter(copy => copy.is_available && copy.condition !== 'lost'),
    [bookCopies]
  );

  // Filter teachers only
  const teachers = staffData?.filter(s => 
    s.department === 'Teaching' || s.designation?.toLowerCase().includes('teacher')
  ) || [];

  // Handle teacher selection - auto-select their class
  const handleTeacherChange = (teacherId: string) => {
    const teacherClass = classesData?.find(cls => cls.class_teacher_id === teacherId);
    setFormData({ 
      ...formData, 
      teacherId, 
      classId: teacherClass?.id || '' 
    });
  };

  const filteredAllocations = allocations.filter((allocation) => {
    const matchesSearch = 
      allocation.book?.title?.toLowerCase().includes(search.toLowerCase()) ||
      allocation.teacher?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      allocation.teacher?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      allocation.book?.book_code?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleBookChange = (bookId: string) => {
    setFormData({ ...formData, bookId });
    setSelectedCopyIds([]);
  };

  const handleCopyToggle = (copyId: string, checked: boolean) => {
    if (checked) {
      setSelectedCopyIds([...selectedCopyIds, copyId]);
    } else {
      setSelectedCopyIds(selectedCopyIds.filter(id => id !== copyId));
    }
  };

  const handleSelectAll = () => {
    if (selectedCopyIds.length === availableCopies.length) {
      setSelectedCopyIds([]);
    } else {
      setSelectedCopyIds(availableCopies.map(c => c.id));
    }
  };

  const handleAllocate = async () => {
    if (!formData.bookId || !formData.teacherId || selectedCopyIds.length === 0) return;
    
    await allocateToTeacher.mutateAsync({
      bookId: formData.bookId,
      teacherId: formData.teacherId,
      classId: formData.classId || undefined,
      copyIds: selectedCopyIds,
      notes: formData.notes || undefined,
    });

    setIsAllocateOpen(false);
    setFormData({ bookId: '', teacherId: '', classId: '', notes: '' });
    setSelectedCopyIds([]);
  };

  const handleReturnAll = async (allocationId: string) => {
    await returnFromTeacher.mutateAsync(allocationId);
  };

  const toggleExpanded = (allocationId: string) => {
    setExpandedAllocations(prev => {
      const next = new Set(prev);
      if (next.has(allocationId)) {
        next.delete(allocationId);
      } else {
        next.add(allocationId);
      }
      return next;
    });
  };

  const getReturnProgress = (allocation: TeacherAllocation) => {
    const copies = allocation.allocation_copies || [];
    const returned = copies.filter(c => c.status === 'returned').length;
    const lost = copies.filter(c => c.status === 'lost').length;
    const total = copies.length;
    return { returned, lost, total, remaining: total - returned - lost };
  };

  const handleReturnCopy = (copyId: string, copyNumber: string) => {
    setReturnCopyId(copyId);
    setReturnCopyNumber(copyNumber);
    setReturnDialogOpen(true);
  };

  const handleMarkLost = (copyId: string, copyNumber: string) => {
    setLostCopyId(copyId);
    setLostCopyNumber(copyNumber);
    setLostDialogOpen(true);
  };

  const confirmReturn = async (condition: string, notes: string) => {
    if (!returnCopyId) return;
    await returnIndividualCopy.mutateAsync({
      allocationCopyId: returnCopyId,
      conditionAtReturn: condition,
      notes,
    });
    setReturnDialogOpen(false);
    setReturnCopyId(null);
  };

  const confirmMarkLost = async (notes: string) => {
    if (!lostCopyId) return;
    await markCopyAsLost.mutateAsync({
      allocationCopyId: lostCopyId,
      notes,
    });
    setLostDialogOpen(false);
    setLostCopyId(null);
  };

  return (
    <DashboardLayout title="Teacher Allocations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teacher Book Allocations</h1>
            <p className="text-muted-foreground">Allocate books to teachers for class distribution</p>
          </div>
          <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Allocate Books
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Allocate Books to Teacher</DialogTitle>
                <DialogDescription>
                  Select specific book copies to assign to a teacher
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="grid gap-4 py-4">
                  {/* Step 1: Select Teacher */}
                  <div className="grid gap-2">
                    <Label htmlFor="teacher">Teacher *</Label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={handleTeacherChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 2: Select Class (Optional) */}
                  <div className="grid gap-2">
                    <Label htmlFor="class">Class (Optional)</Label>
                    <Select
                      value={formData.classId || "__none__"}
                      onValueChange={(value) => setFormData({ ...formData, classId: value === "__none__" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No specific class</SelectItem>
                        {classesData?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} - {cls.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 3: Select Book */}
                  <div className="grid gap-2">
                    <Label htmlFor="book">Book *</Label>
                    <Select
                      value={formData.bookId}
                      onValueChange={handleBookChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.title} {book.book_code ? `(${book.book_code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 4: Select Copies */}
                  {formData.bookId && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Select Book Copies *</Label>
                        {availableCopies.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                          >
                            {selectedCopyIds.length === availableCopies.length ? 'Deselect All' : 'Select All'}
                          </Button>
                        )}
                      </div>
                      {copiesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : availableCopies.length === 0 ? (
                        <div className="border rounded-md p-4 text-center text-muted-foreground">
                          <BookCopy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No available copies for this book</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-48 border rounded-md p-3">
                          <div className="space-y-2">
                            {availableCopies.map((copy) => (
                              <div key={copy.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                                <Checkbox
                                  id={copy.id}
                                  checked={selectedCopyIds.includes(copy.id)}
                                  onCheckedChange={(checked) => handleCopyToggle(copy.id, !!checked)}
                                />
                                <label htmlFor={copy.id} className="flex-1 text-sm cursor-pointer">
                                  <span className="font-medium">{copy.copy_number}</span>
                                  {copy.barcode && (
                                    <span className="text-muted-foreground ml-2">({copy.barcode})</span>
                                  )}
                                  {copy.condition && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {copy.condition}
                                    </Badge>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {selectedCopyIds.length} of {availableCopies.length} copies selected
                      </p>
                    </div>
                  )}

                  {/* Step 5: Notes */}
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional notes about this allocation"
                    />
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAllocateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAllocate}
                  disabled={!formData.bookId || !formData.teacherId || selectedCopyIds.length === 0 || allocateToTeacher.isPending}
                >
                  {allocateToTeacher.isPending ? 'Allocating...' : `Allocate ${selectedCopyIds.length} Copies`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Allocations</CardTitle>
                <CardDescription>{allocations.length} total allocations</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search allocations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredAllocations.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {search ? 'No allocations match your search' : 'No book allocations yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAllocations.map((allocation) => {
                  const isExpanded = expandedAllocations.has(allocation.id);
                  const progress = getReturnProgress(allocation);
                  
                  return (
                    <Collapsible key={allocation.id} open={isExpanded}>
                      <div className="border rounded-lg overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div 
                            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleExpanded(allocation.id)}
                          >
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
                              <div>
                                <p className="font-medium">{allocation.book?.title || 'Unknown'}</p>
                                <p className="text-sm text-muted-foreground">{allocation.book?.book_code || '-'}</p>
                              </div>
                              <div>
                                <p className="text-sm">
                                  {allocation.teacher
                                    ? `${allocation.teacher.first_name} ${allocation.teacher.last_name}`
                                    : '-'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {allocation.class?.name || 'General'}
                                </p>
                              </div>
                              <div className="text-center">
                                <Badge 
                                  variant={progress.remaining > 0 ? 'outline' : 'secondary'}
                                  className="font-mono"
                                >
                                  {progress.returned}/{progress.total}
                                </Badge>
                                {progress.lost > 0 && (
                                  <Badge variant="destructive" className="ml-1 text-xs">
                                    {progress.lost} lost
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(allocation.allocated_at), 'MMM d, yyyy')}
                              </div>
                              <div>
                                <Badge
                                  variant={
                                    allocation.status === 'active'
                                      ? 'outline'
                                      : allocation.status === 'partial'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {allocation.status}
                                </Badge>
                              </div>
                              <div className="text-right">
                                {allocation.status !== 'returned' && progress.remaining > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReturnAll(allocation.id);
                                    }}
                                    disabled={returnFromTeacher.isPending}
                                  >
                                    <Undo2 className="h-3.5 w-3.5 mr-1" />
                                    Return All ({progress.remaining})
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="border-t bg-muted/20">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="pl-10">Copy #</TableHead>
                                  <TableHead>Barcode</TableHead>
                                  <TableHead>Condition</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Returned</TableHead>
                                  <TableHead>Return Condition</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allocation.allocation_copies?.map((copy) => (
                                  <AllocationCopyRow
                                    key={copy.id}
                                    copy={copy}
                                    onReturn={() => handleReturnCopy(copy.id, copy.copy?.copy_number || 'Unknown')}
                                    onMarkLost={() => handleMarkLost(copy.id, copy.copy?.copy_number || 'Unknown')}
                                    isReturning={returnIndividualCopy.isPending}
                                    isMarkingLost={markCopyAsLost.isPending}
                                  />
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Return Dialog */}
      <ReturnCopyDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        copyNumber={returnCopyNumber}
        onConfirm={confirmReturn}
        isPending={returnIndividualCopy.isPending}
      />

      {/* Mark Lost Dialog */}
      <MarkLostDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        copyNumber={lostCopyNumber}
        onConfirm={confirmMarkLost}
        isPending={markCopyAsLost.isPending}
      />
    </DashboardLayout>
  );
}