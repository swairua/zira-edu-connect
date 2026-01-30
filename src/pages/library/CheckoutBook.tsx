import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAvailableCopies } from '@/hooks/useLibraryBooks';
import { useLibraryLoans, useStudentActiveLoans } from '@/hooks/useLibraryLoans';
import { useLibrarySettings } from '@/hooks/useLibrarySettings';
import { useStudents } from '@/hooks/useStudents';
import { useInstitution } from '@/contexts/InstitutionContext';
import { BookOpen, User, Calendar, AlertTriangle, Check, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function CheckoutBook() {
  const navigate = useNavigate();
  const { data: availableCopies, isLoading: copiesLoading } = useAvailableCopies();
  const { institutionId } = useInstitution();
  const { data: students = [], isLoading: studentsLoading } = useStudents(institutionId);
  const { settings } = useLibrarySettings();
  const { checkoutBook } = useLibraryLoans();

  const [selectedCopyId, setSelectedCopyId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), settings?.loan_period_days || 14), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState('');
  const [searchCopy, setSearchCopy] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  const { data: studentLoans } = useStudentActiveLoans(selectedStudentId || undefined);

  const activeStudents = students.filter((s) => s.status === 'active');
  
  const filteredCopies = availableCopies?.filter((copy) => {
    const search = searchCopy.toLowerCase();
    return (
      copy.book?.title?.toLowerCase().includes(search) ||
      copy.copy_number?.toLowerCase().includes(search) ||
      copy.barcode?.toLowerCase().includes(search)
    );
  }) || [];

  const filteredStudents = activeStudents.filter((student) => {
    const search = searchStudent.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(search) ||
      student.last_name?.toLowerCase().includes(search) ||
      student.admission_number?.toLowerCase().includes(search)
    );
  });

  const selectedCopy = availableCopies?.find((c) => c.id === selectedCopyId);
  const selectedStudent = activeStudents.find((s) => s.id === selectedStudentId);

  const maxBooks = settings?.max_books_per_student || 3;
  const currentLoans = studentLoans?.length || 0;
  const canBorrow = currentLoans < maxBooks;

  const handleCheckout = async () => {
    if (!selectedCopyId || !selectedStudentId || !dueDate) return;

    await checkoutBook.mutateAsync({
      copyId: selectedCopyId,
      studentId: selectedStudentId,
      dueDate,
      notes: notes || undefined,
    });

    navigate('/library/loans');
  };

  return (
    <DashboardLayout title="Checkout Book">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issue Books</h1>
          <p className="text-muted-foreground">Issue books to students or allocate to teachers</p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Issue to Student
            </TabsTrigger>
            <TabsTrigger 
              value="teacher" 
              className="flex items-center gap-2"
              onClick={() => navigate('/library/allocations')}
            >
              <Users className="h-4 w-4" />
              Allocate to Teacher
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Select Book */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Select Book
              </CardTitle>
              <CardDescription>Choose an available book copy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Books</Label>
                <Input
                  placeholder="Search by title, copy number, or barcode..."
                  value={searchCopy}
                  onChange={(e) => setSearchCopy(e.target.value)}
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {copiesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : filteredCopies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available copies found</p>
                ) : (
                  filteredCopies.slice(0, 20).map((copy) => (
                    <div
                      key={copy.id}
                      onClick={() => setSelectedCopyId(copy.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCopyId === copy.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{copy.book?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Copy: {copy.copy_number} • {copy.book?.author}
                          </p>
                        </div>
                        {selectedCopyId === copy.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedCopy && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected:</p>
                  <p className="font-medium">{selectedCopy.book?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Copy #{selectedCopy.copy_number} • Condition: {selectedCopy.condition}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Select Student */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Student
              </CardTitle>
              <CardDescription>Choose the borrowing student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Students</Label>
                <Input
                  placeholder="Search by name or admission number..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {studentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students found</p>
                ) : (
                  filteredStudents.slice(0, 20).map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStudentId === student.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.admission_number}
                          </p>
                        </div>
                        {selectedStudentId === student.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedStudent && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Selected:</p>
                      <p className="font-medium">
                        {selectedStudent.first_name} {selectedStudent.last_name}
                      </p>
                    </div>
                    <Badge variant={canBorrow ? 'default' : 'destructive'}>
                      {currentLoans}/{maxBooks} books
                    </Badge>
                  </div>
                  {!canBorrow && (
                    <div className="flex items-center gap-2 mt-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Borrowing limit reached</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Checkout Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Checkout Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default loan period: {settings?.loan_period_days || 14} days
                </p>
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this checkout..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/library')}>
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={
                  !selectedCopyId ||
                  !selectedStudentId ||
                  !dueDate ||
                  !canBorrow ||
                  checkoutBook.isPending
                }
              >
                {checkoutBook.isPending ? 'Processing...' : 'Complete Checkout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
