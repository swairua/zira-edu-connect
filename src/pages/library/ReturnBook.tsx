import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLibraryLoans, LibraryLoan } from '@/hooks/useLibraryLoans';
import { BookCheck, Search, AlertTriangle, Check } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function ReturnBook() {
  const navigate = useNavigate();
  const { loans, isLoading, returnBook, markAsLost } = useLibraryLoans('active');
  const [search, setSearch] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<LibraryLoan | null>(null);
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');

  const filteredLoans = loans.filter((loan) => {
    const searchLower = search.toLowerCase();
    return (
      loan.copy?.book?.title?.toLowerCase().includes(searchLower) ||
      loan.copy?.copy_number?.toLowerCase().includes(searchLower) ||
      loan.copy?.barcode?.toLowerCase().includes(searchLower) ||
      loan.student?.first_name?.toLowerCase().includes(searchLower) ||
      loan.student?.last_name?.toLowerCase().includes(searchLower) ||
      loan.student?.admission_number?.toLowerCase().includes(searchLower)
    );
  });

  const handleReturn = async () => {
    if (!selectedLoan) return;

    if (condition === 'lost') {
      await markAsLost.mutateAsync(selectedLoan.id);
    } else {
      await returnBook.mutateAsync({
        loanId: selectedLoan.id,
        conditionAtReturn: condition,
        notes: notes || undefined,
      });
    }

    navigate('/library/loans');
  };

  const getOverdueInfo = (loan: LibraryLoan) => {
    const isOverdue = isPast(new Date(loan.due_date));
    if (!isOverdue) return null;
    const daysOverdue = differenceInDays(new Date(), new Date(loan.due_date));
    return { daysOverdue, isOverdue };
  };

  return (
    <DashboardLayout title="Return Book">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Return Book</h1>
          <p className="text-muted-foreground">Process a book return</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Find Loan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Active Loan
              </CardTitle>
              <CardDescription>Search by book, copy number, or student</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : filteredLoans.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No matching loans found' : 'No active loans'}
                  </p>
                ) : (
                  filteredLoans.map((loan) => {
                    const overdueInfo = getOverdueInfo(loan);
                    return (
                      <div
                        key={loan.id}
                        onClick={() => {
                          setSelectedLoan(loan);
                          setCondition(loan.condition_at_checkout || 'good');
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLoan?.id === loan.id
                            ? 'border-primary bg-primary/5'
                            : overdueInfo?.isOverdue
                            ? 'border-destructive/50 hover:border-destructive'
                            : 'hover:border-muted-foreground/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{loan.copy?.book?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Copy: {loan.copy?.copy_number}
                            </p>
                            <p className="text-sm">
                              {loan.student?.first_name} {loan.student?.last_name} (
                              {loan.student?.admission_number})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(loan.due_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {overdueInfo?.isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                {overdueInfo.daysOverdue}d overdue
                              </Badge>
                            )}
                            {selectedLoan?.id === loan.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Return Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookCheck className="h-5 w-5" />
                Return Details
              </CardTitle>
              <CardDescription>
                {selectedLoan ? 'Complete the return process' : 'Select a loan to return'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLoan ? (
                <>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedLoan.copy?.book?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Copy #{selectedLoan.copy?.copy_number}
                    </p>
                    <p className="text-sm">
                      Borrowed by: {selectedLoan.student?.first_name}{' '}
                      {selectedLoan.student?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Checked out: {format(new Date(selectedLoan.borrowed_at), 'MMM d, yyyy')}
                    </p>
                    {getOverdueInfo(selectedLoan)?.isOverdue && (
                      <div className="flex items-center gap-2 mt-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {getOverdueInfo(selectedLoan)?.daysOverdue} days overdue
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Condition at Return</Label>
                    <RadioGroup
                      value={condition}
                      onValueChange={setCondition}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="good" id="good" />
                        <Label htmlFor="good" className="font-normal">
                          Good - No damage
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fair" id="fair" />
                        <Label htmlFor="fair" className="font-normal">
                          Fair - Minor wear
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="damaged" id="damaged" />
                        <Label htmlFor="damaged" className="font-normal text-orange-600">
                          Damaged - Needs repair
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lost" id="lost" />
                        <Label htmlFor="lost" className="font-normal text-destructive">
                          Lost - Book is lost
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {(condition === 'damaged' || condition === 'lost') && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">
                        {condition === 'lost'
                          ? 'A lost book penalty will be applied to this student.'
                          : 'A damage penalty may be applied to this student.'}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any notes about the return..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setSelectedLoan(null)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReturn}
                      disabled={returnBook.isPending || markAsLost.isPending}
                      variant={condition === 'lost' ? 'destructive' : 'default'}
                    >
                      {returnBook.isPending || markAsLost.isPending
                        ? 'Processing...'
                        : condition === 'lost'
                        ? 'Mark as Lost'
                        : 'Complete Return'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a loan from the list to process a return</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
