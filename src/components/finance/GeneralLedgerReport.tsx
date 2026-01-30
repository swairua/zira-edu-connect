import { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useChartOfAccounts, useJournalEntries } from '@/hooks/useAccounting';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset', color: 'bg-blue-100 text-blue-700' },
  { value: 'liability', label: 'Liability', color: 'bg-red-100 text-red-700' },
  { value: 'equity', label: 'Equity', color: 'bg-purple-100 text-purple-700' },
  { value: 'income', label: 'Income', color: 'bg-green-100 text-green-700' },
  { value: 'expense', label: 'Expense', color: 'bg-orange-100 text-orange-700' },
];

interface JournalLine {
  id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  fund_id?: string;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference: string | null;
  source_type: string;
  status: string;
  lines?: JournalLine[];
}

interface GeneralLedgerReportProps {
  institutionId: string | null;
}

export function GeneralLedgerReport({ institutionId }: GeneralLedgerReportProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const { data: accounts = [], isLoading: loadingAccounts } = useChartOfAccounts(institutionId);
  const { data: journalEntries = [], isLoading: loadingEntries } = useJournalEntries(institutionId);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (typeFilter !== 'all' && account.account_type !== typeFilter) return false;
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        account.account_name.toLowerCase().includes(search) ||
        account.account_code.toLowerCase().includes(search)
      );
    });
  }, [accounts, typeFilter, searchQuery]);

  // Get transactions for selected account
  const accountTransactions = useMemo(() => {
    if (!selectedAccount) return [];

    const transactions: {
      date: string;
      entryNumber: string;
      description: string;
      reference: string | null;
      debit: number;
      credit: number;
      balance: number;
    }[] = [];

    let runningBalance = 0;
    const account = accounts.find((a) => a.id === selectedAccount);
    if (!account) return [];

    // Get all journal entries that affect this account
    const relevantEntries = journalEntries
      .filter((je: JournalEntry) => je.status === 'posted')
      .filter(
        (je: JournalEntry) =>
          new Date(je.entry_date) >= new Date(startDate) &&
          new Date(je.entry_date) <= new Date(endDate)
      )
      .filter((je: JournalEntry) => je.lines?.some((line: JournalLine) => line.account_id === selectedAccount))
      .sort(
        (a: JournalEntry, b: JournalEntry) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
      );

    relevantEntries.forEach((entry: JournalEntry) => {
      const line = entry.lines?.find((l: JournalLine) => l.account_id === selectedAccount);
      if (!line) return;

      const debit = line.debit_amount || 0;
      const credit = line.credit_amount || 0;

      // Calculate running balance based on normal balance
      if (account.normal_balance === 'debit') {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }

      transactions.push({
        date: entry.entry_date,
        entryNumber: entry.entry_number,
        description: line.description || entry.description,
        reference: entry.reference,
        debit,
        credit,
        balance: runningBalance,
      });
    });

    return transactions;
  }, [selectedAccount, journalEntries, accounts, startDate, endDate]);

  // Calculate account balances for list view
  const accountBalances = useMemo(() => {
    const balances = new Map<string, { debit: number; credit: number; balance: number }>();

    journalEntries
      .filter((je: JournalEntry) => je.status === 'posted')
      .filter(
        (je: JournalEntry) =>
          new Date(je.entry_date) >= new Date(startDate) &&
          new Date(je.entry_date) <= new Date(endDate)
      )
      .forEach((entry: JournalEntry) => {
        entry.lines?.forEach((line: JournalLine) => {
          const current = balances.get(line.account_id) || { debit: 0, credit: 0, balance: 0 };
          const account = accounts.find((a) => a.id === line.account_id);
          const debit = line.debit_amount || 0;
          const credit = line.credit_amount || 0;

          let newBalance = current.balance;
          if (account?.normal_balance === 'debit') {
            newBalance += debit - credit;
          } else {
            newBalance += credit - debit;
          }

          balances.set(line.account_id, {
            debit: current.debit + debit,
            credit: current.credit + credit,
            balance: newBalance,
          });
        });
      });

    return balances;
  }, [journalEntries, accounts, startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = () => {
    if (!selectedAccount) return;
    const account = accounts.find((a) => a.id === selectedAccount);
    if (!account) return;

    const headers = ['Date', 'Entry #', 'Description', 'Reference', 'Debit', 'Credit', 'Balance'];
    const rows = accountTransactions.map((t) => [
      t.date,
      t.entryNumber,
      t.description,
      t.reference || '',
      t.debit.toFixed(2),
      t.credit.toFixed(2),
      t.balance.toFixed(2),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${account.account_code}-${startDate}-${endDate}.csv`;
    a.click();
  };

  const isLoading = loadingAccounts || loadingEntries;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                General Ledger
              </CardTitle>
              <CardDescription>View account transaction history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Accounts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Accounts</CardTitle>
            <CardDescription>{filteredAccounts.length} accounts</CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[600px] overflow-auto">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
              </div>
            ) : (
              <div className="divide-y">
                {filteredAccounts.map((account) => {
                  const balance = accountBalances.get(account.id);
                  const typeConfig = ACCOUNT_TYPES.find((t) => t.value === account.account_type);

                  return (
                    <button
                      key={account.id}
                      className={cn(
                        'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                        selectedAccount === account.id && 'bg-primary/10 border-l-4 border-primary'
                      )}
                      onClick={() => setSelectedAccount(account.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <code className="text-xs text-muted-foreground">
                            {account.account_code}
                          </code>
                          <p className="font-medium text-sm">{account.account_name}</p>
                        </div>
                        <Badge className={cn('text-xs', typeConfig?.color)}>
                          {typeConfig?.label}
                        </Badge>
                      </div>
                      {balance && (
                        <p
                          className={cn(
                            'text-sm font-mono mt-1',
                            balance.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(balance.balance)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedAccount
                    ? accounts.find((a) => a.id === selectedAccount)?.account_name
                    : 'Select an Account'}
                </CardTitle>
                {selectedAccount && (
                  <CardDescription>
                    {format(new Date(startDate), 'MMM d, yyyy')} -{' '}
                    {format(new Date(endDate), 'MMM d, yyyy')}
                  </CardDescription>
                )}
              </div>
              {selectedAccount && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedAccount ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an account to view transactions</p>
              </div>
            ) : accountTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found for this period</p>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Date</TableHead>
                      <TableHead className="w-28">Entry #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-28">Debit</TableHead>
                      <TableHead className="text-right w-28">Credit</TableHead>
                      <TableHead className="text-right w-32">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {format(new Date(transaction.date), 'MMM d')}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {transaction.entryNumber}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {transaction.description}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-mono text-sm font-medium',
                            transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(transaction.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
