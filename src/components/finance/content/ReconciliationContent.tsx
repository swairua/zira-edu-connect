import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInstitution } from '@/contexts/InstitutionContext';
import { 
  useReconciliationRecords, 
  useReconciliationSummary,
  useMarkAsException,
  useIgnoreReconciliationRecord,
  ReconciliationStatus,
  ReconciliationSource
} from '@/hooks/useReconciliation';
import { BankStatementImportDialog } from '@/components/finance/BankStatementImportDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Search,
  RefreshCw,
  Building2,
  Smartphone,
  Banknote,
  FileText,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

const SOURCE_ICONS: Record<ReconciliationSource, React.ReactNode> = {
  bank: <Building2 className="h-4 w-4" />,
  mpesa: <Smartphone className="h-4 w-4 text-green-600" />,
  cash: <Banknote className="h-4 w-4" />,
  cheque: <FileText className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />,
};

const STATUS_STYLES: Record<ReconciliationStatus, { color: string; icon: React.ReactNode }> = {
  matched: { color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
  unmatched: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle className="h-3 w-3" /> },
  exception: { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
  duplicate: { color: 'bg-orange-100 text-orange-800', icon: <RefreshCw className="h-3 w-3" /> },
  ignored: { color: 'bg-gray-100 text-gray-800', icon: <Eye className="h-3 w-3" /> },
};

export function ReconciliationContent() {
  const { institution } = useInstitution();
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<ReconciliationSource | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['reconciliation-records'] });
    queryClient.invalidateQueries({ queryKey: ['reconciliation-summary'] });
  };
  
  const { data: summary, isLoading: loadingSummary } = useReconciliationSummary(
    institution?.id || null,
    dateFilter
  );
  const { data: records, isLoading: loadingRecords } = useReconciliationRecords(
    institution?.id || null,
    {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      source: sourceFilter !== 'all' ? sourceFilter : undefined,
      dateFrom: dateFilter,
      dateTo: dateFilter,
    }
  );
  
  const markAsException = useMarkAsException();
  const ignoreRecord = useIgnoreReconciliationRecord();

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const matchRate = summary ? 
    (summary.total_records > 0 ? (summary.matched / summary.total_records) * 100 : 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
          <p className="text-muted-foreground">Match payments with bank and M-Pesa transactions</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import Statement
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{summary?.total_records || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(summary?.total_external_amount || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Matched
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{summary?.matched || 0}</div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(summary?.total_matched_amount || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Unmatched
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">{summary?.unmatched || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {(summary?.exceptions || 0) + (summary?.duplicates || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Match Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={matchRate} className="flex-1" />
            <span className="text-sm font-medium">{matchRate.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="unmatched" className="gap-2">
            Unmatched
            {summary?.unmatched ? (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 ml-1">
                {summary.unmatched}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="gap-2">
            Exceptions
            {(summary?.exceptions || 0) + (summary?.duplicates || 0) > 0 ? (
              <Badge variant="secondary" className="bg-red-100 text-red-800 ml-1">
                {(summary?.exceptions || 0) + (summary?.duplicates || 0)}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Records</CardTitle>
                  <CardDescription>Bank and M-Pesa transactions for reconciliation</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as ReconciliationSource | 'all')}>
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReconciliationStatus | 'all')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="matched">Matched</SelectItem>
                      <SelectItem value="unmatched">Unmatched</SelectItem>
                      <SelectItem value="exception">Exception</SelectItem>
                      <SelectItem value="duplicate">Duplicate</SelectItem>
                      <SelectItem value="ignored">Ignored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRecords ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !records?.length ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No records found for this date</p>
                  <p className="text-sm">Import a bank statement or M-Pesa report to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Matched Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="text-sm">
                          {record.external_date 
                            ? format(new Date(record.external_date), 'MMM d, yyyy')
                            : format(new Date(record.reconciliation_date), 'MMM d, yyyy')
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {SOURCE_ICONS[record.source]}
                            <span className="capitalize text-sm">{record.source}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.external_reference || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">
                          {record.external_description || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(record.external_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`gap-1 ${STATUS_STYLES[record.status].color}`}>
                            {STATUS_STYLES[record.status].icon}
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.matched_payment ? (
                            <span className="text-sm font-mono">
                              {record.matched_payment.receipt_number}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {record.status === 'unmatched' && (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => ignoreRecord.mutate({ 
                                  id: record.id, 
                                  institutionId: institution!.id 
                                })}
                              >
                                Ignore
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => markAsException.mutate({ 
                                  id: record.id, 
                                  institutionId: institution!.id,
                                  exception_type: 'manual',
                                })}
                              >
                                Flag
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unmatched">
          <Card>
            <CardHeader>
              <CardTitle>Unmatched Transactions</CardTitle>
              <CardDescription>Transactions that need to be matched with recorded payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select "Unmatched" filter to view unmatched transactions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions">
          <Card>
            <CardHeader>
              <CardTitle>Exception Items</CardTitle>
              <CardDescription>Transactions flagged for review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exceptions currently flagged</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {institution?.id && (
        <BankStatementImportDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          institutionId={institution.id}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
