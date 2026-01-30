import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { useInstitution } from '@/contexts/InstitutionContext';
import { useFeeStatement, getPeriodDates, type PeriodPreset } from '@/hooks/useFeeStatement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { downloadFeeStatementPDF } from '@/lib/pdf/invoice-pdf';
import { format } from 'date-fns';
import { Download, Printer, FileText, Search, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FeeStatement() {
  const { institutionId, institution } = useInstitution();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this_year');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const periodDates = getPeriodDates(
    periodPreset,
    customStart ? new Date(customStart) : undefined,
    customEnd ? new Date(customEnd) : undefined
  );

  // Fetch students for search
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students-search', institutionId, searchTerm],
    queryFn: async () => {
      if (!institutionId) return [];
      
      let query = supabase
        .from('students')
        .select('id, first_name, last_name, admission_number, class_id')
        .eq('institution_id', institutionId)
        .order('first_name');

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,admission_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  const { data: statement, isLoading: statementLoading } = useFeeStatement(
    selectedStudentId,
    institutionId,
    periodDates.start,
    periodDates.end
  );

  const handleDownloadPDF = () => {
    if (!statement || !institution) return;
    
    downloadFeeStatementPDF({
      student: statement.student,
      institution,
      period: statement.period,
      openingBalance: statement.openingBalance,
      transactions: statement.transactions,
      closingBalance: statement.closingBalance,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Badge variant="secondary">Invoice</Badge>;
      case 'payment':
        return <Badge variant="default">Payment</Badge>;
      case 'adjustment':
        return <Badge variant="outline">Adjustment</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Fee Statement" subtitle="Generate fee statements for students">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Statement</CardTitle>
            <CardDescription>Select a student and period to generate a fee statement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Student Search */}
              <div className="space-y-2 sm:col-span-2">
                <Label>Student</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchTerm && students.length > 0 && !selectedStudentId && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setSearchTerm(`${student.first_name} ${student.last_name}`);
                        }}
                      >
                        <span className="font-medium">
                          {student.first_name} {student.last_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({student.admission_number})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedStudentId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedStudentId(null);
                      setSearchTerm('');
                    }}
                  >
                    Clear selection
                  </Button>
                )}
              </div>

              {/* Period Preset */}
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={periodPreset} onValueChange={(v) => setPeriodPreset(v as PeriodPreset)}>
                  <SelectTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_term">This Term</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={!statement}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handlePrint} disabled={!statement}>
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            {periodPreset === 'custom' && (
              <div className="mt-4 flex gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statement Preview */}
        {selectedStudentId && (
          <Card className="print:shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Fee Statement
                  </CardTitle>
                  <CardDescription>
                    {format(periodDates.start, 'dd MMM yyyy')} - {format(periodDates.end, 'dd MMM yyyy')}
                  </CardDescription>
                </div>
                {statement && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-semibold">
                      {statement.student.first_name} {statement.student.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{statement.student.admission_number}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {statementLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : statement ? (
                <div className="space-y-4">
                  {/* Opening Balance */}
                  <div className="flex justify-between rounded-lg bg-muted/50 p-3">
                    <span className="font-medium">Opening Balance</span>
                    <span className={`font-bold ${statement.openingBalance > 0 ? 'text-destructive' : 'text-success'}`}>
                      KES {statement.openingBalance.toLocaleString()}
                    </span>
                  </div>

                  {/* Transactions Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statement.transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No transactions in this period
                          </TableCell>
                        </TableRow>
                      ) : (
                        statement.transactions.map((t, i) => (
                          <TableRow key={i}>
                            <TableCell>{format(new Date(t.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell>{t.description}</TableCell>
                            <TableCell>{getTransactionTypeBadge(t.type)}</TableCell>
                            <TableCell className="text-right text-destructive">
                              {t.debit ? `KES ${t.debit.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell className="text-right text-success">
                              {t.credit ? `KES ${t.credit.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              KES {t.balance.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-semibold">Totals</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          KES {statement.totalDebits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-success">
                          KES {statement.totalCredits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          KES {statement.closingBalance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>

                  {/* Closing Balance */}
                  <div className="flex justify-between rounded-lg bg-primary/10 p-4">
                    <span className="text-lg font-semibold">Closing Balance</span>
                    <span className={`text-xl font-bold ${statement.closingBalance > 0 ? 'text-destructive' : 'text-success'}`}>
                      KES {statement.closingBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No statement available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a student to generate their fee statement
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
