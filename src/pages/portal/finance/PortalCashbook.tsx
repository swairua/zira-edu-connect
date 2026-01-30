import { useState } from 'react';
import { format } from 'date-fns';
import {
  Book,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCashbook, useBankAccounts } from '@/hooks/useAccounting';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { cn } from '@/lib/utils';

export default function PortalCashbook() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: bankAccounts = [], isLoading: loadingBanks } = useBankAccounts(institutionId);
  const { data: entries = [], isLoading: loadingEntries, refetch } = useCashbook(
    institutionId,
    selectedBank !== 'all' ? selectedBank : undefined,
    dateFrom || undefined,
    dateTo || undefined
  );

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      entry.description.toLowerCase().includes(search) ||
      entry.reference_number?.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totals = filteredEntries.reduce(
    (acc, entry) => ({
      debits: acc.debits + (entry.debit_amount || 0),
      credits: acc.credits + (entry.credit_amount || 0),
    }),
    { debits: 0, credits: 0 }
  );

  const selectedBankData = bankAccounts.find((b) => b.id === selectedBank);

  return (
    <PortalLayout title="Cashbook" subtitle="View and manage cashbook entries">
      <div className="space-y-6">
        {/* Bank Account Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {loadingBanks ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-32" />
                  </CardContent>
                </Card>
              ))
          ) : (
            <>
              {bankAccounts.slice(0, 3).map((account) => (
                <Card
                  key={account.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/50',
                    selectedBank === account.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => setSelectedBank(account.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {account.account_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(account.current_balance)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.bank_name} • {account.account_number.slice(-4)}
                    </p>
                  </CardContent>
                </Card>
              ))}
              <Card
                className={cn(
                  'cursor-pointer transition-colors hover:bg-muted/50',
                  selectedBank === 'all' && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedBank('all')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    All Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(bankAccounts.reduce((sum, a) => sum + a.current_balance, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bankAccounts.length} accounts
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Cashbook Entries
                {selectedBankData && (
                  <Badge variant="outline">{selectedBankData.account_name}</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter Row */}
            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search by description or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full sm:w-[150px]"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full sm:w-[150px]"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Summary Row */}
            <div className="flex gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Receipts:</span>
                <span className="font-semibold text-green-600">{formatCurrency(totals.debits)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-red-600" />
                <span className="text-sm text-muted-foreground">Payments:</span>
                <span className="font-semibold text-red-600">{formatCurrency(totals.credits)}</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Net:</span>
                <span className={cn('font-semibold', totals.debits - totals.credits >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {formatCurrency(totals.debits - totals.credits)}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Bank Account</TableHead>
                    <TableHead className="text-right">Debit (In)</TableHead>
                    <TableHead className="text-right">Credit (Out)</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingEntries ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          {Array(8)
                            .fill(0)
                            .map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                        </TableRow>
                      ))
                  ) : filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        No cashbook entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {format(new Date(entry.entry_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {entry.reference_number || '-'}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {entry.description}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {entry.bank_account?.account_name || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.debit_amount > 0 ? (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(entry.debit_amount)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit_amount > 0 ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(entry.credit_amount)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.running_balance !== null
                            ? formatCurrency(entry.running_balance)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {entry.reconciled ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reconciled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
