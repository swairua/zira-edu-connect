import { useState, useMemo } from 'react';
import { UnifiedPortalLayout } from '@/components/layout/UnifiedPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { useMyAllocations } from '@/hooks/useTeacherAllocations';
import { useDistributeToStudent } from '@/hooks/useDistributeToStudent';
import { BookOpen, ArrowLeft, Search, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/hooks/useStudents';
import { useInstitution } from '@/contexts/InstitutionContext';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AvailableCopy {
  id: string;
  copy_id: string;
  bookTitle: string;
  bookCode: string | null;
  className: string | null;
  classId: string | null;
  allocationId: string;
  copy?: {
    id: string;
    copy_number: string;
    barcode: string | null;
    condition: string | null;
  };
}

export default function TeacherDistributeBooks() {
  const { data: profile, isLoading: profileLoading } = useStaffProfile();
  const { data: allocations, isLoading: allocationsLoading } = useMyAllocations();
  const { institutionId } = useInstitution();
  const navigate = useNavigate();
  
  // Form state
  const [selectedCopy, setSelectedCopy] = useState<AvailableCopy | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14));
  const [notes, setNotes] = useState('');
  
  const { mutate: distributeToStudent, isPending: isDistributing } = useDistributeToStudent();

  // Get copies that are still allocated (not returned/lost and not distributed)
  const availableCopies: AvailableCopy[] = useMemo(() => {
    return allocations?.flatMap(a => 
      (a.allocation_copies || [])
        .filter(c => c.status === 'allocated')
        .map(c => ({
          id: c.id,
          copy_id: c.copy_id,
          bookTitle: a.book?.title || 'Unknown Book',
          bookCode: a.book?.book_code || null,
          className: a.class?.name || null,
          classId: a.class?.id || null,
          allocationId: a.id,
          copy: c.copy,
        }))
    ) || [];
  }, [allocations]);

  // Get students filtered by the selected copy's class
  const { data: students = [], isLoading: studentsLoading } = useStudents(
    institutionId,
    {
      classId: selectedCopy?.classId || undefined,
      status: 'active',
      search: studentSearch || undefined,
    }
  );

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students.slice(0, 20);
    return students;
  }, [students, studentSearch]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleDistribute = () => {
    if (!selectedCopy || !selectedStudentId) return;
    
    distributeToStudent({
      allocationCopyId: selectedCopy.id,
      copyId: selectedCopy.copy_id,
      studentId: selectedStudentId,
      allocationId: selectedCopy.allocationId,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        // Reset form
        setSelectedCopy(null);
        setSelectedStudentId(null);
        setStudentSearch('');
        setNotes('');
        setDueDate(addDays(new Date(), 14));
      }
    });
  };

  const handleCopySelect = (copy: AvailableCopy) => {
    setSelectedCopy(copy);
    setSelectedStudentId(null);
    setStudentSearch('');
  };

  return (
    <UnifiedPortalLayout
      portalType="teacher"
      title="Distribute Books"
      subtitle="Distribute allocated books to students in your class"
      userName={profile ? `${profile.first_name} ${profile.last_name}` : 'Teacher'}
      isLoading={profileLoading}
    >
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/portal/library')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Books
        </Button>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Step 1: Select Book Copy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                Select Book Copy
              </CardTitle>
              <CardDescription>
                Choose a book from your allocated copies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allocationsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : availableCopies.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No books available for distribution</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All your allocated books have been distributed or returned
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {availableCopies.map((copy) => (
                    <button
                      key={copy.id}
                      onClick={() => handleCopySelect(copy)}
                      className={cn(
                        'w-full flex items-center justify-between p-4 border rounded-lg text-left transition-colors',
                        selectedCopy?.id === copy.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      <div>
                        <p className="font-medium">{copy.bookTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Copy #{copy.copy?.copy_number} 
                          {copy.copy?.barcode && ` • ${copy.copy.barcode}`}
                        </p>
                        {copy.className && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            For: {copy.className}
                          </Badge>
                        )}
                      </div>
                      {selectedCopy?.id === copy.id && (
                        <div className="h-4 w-4 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Select Student */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-sm',
                  selectedCopy ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>2</span>
                Select Student
              </CardTitle>
              <CardDescription>
                {selectedCopy 
                  ? `Choose a student ${selectedCopy.className ? `from ${selectedCopy.className}` : ''}`
                  : 'First select a book copy'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCopy ? (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a book copy first</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {studentsLoading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading students...</div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        {studentSearch ? 'No students found' : 'No students in this class'}
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudentId(student.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 border rounded-lg text-left transition-colors',
                            selectedStudentId === student.id
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'hover:bg-muted/50'
                          )}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.photo_url || undefined} />
                            <AvatarFallback>
                              {student.first_name[0]}{student.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {student.admission_number}
                            </p>
                          </div>
                          {selectedStudentId === student.id && (
                            <div className="h-4 w-4 rounded-full bg-primary flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Distribution Details */}
        {selectedCopy && selectedStudentId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                Distribution Details
              </CardTitle>
              <CardDescription>
                Set the due date and add any notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Summary */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Book:</span>
                      <span className="font-medium">{selectedCopy.bookTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Copy #:</span>
                      <span className="font-medium">{selectedCopy.copy?.copy_number}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Student:</span>
                      <span className="font-medium">
                        {selectedStudent?.first_name} {selectedStudent?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Adm No:</span>
                      <span className="font-medium">{selectedStudent?.admission_number}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dueDate && 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, 'PPP') : 'Select due date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dueDate}
                          onSelect={(date) => date && setDueDate(date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="e.g., For term 2 reading..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCopy(null);
                    setSelectedStudentId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDistribute}
                  disabled={isDistributing}
                >
                  {isDistributing ? 'Distributing...' : 'Distribute Book'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UnifiedPortalLayout>
  );
}
