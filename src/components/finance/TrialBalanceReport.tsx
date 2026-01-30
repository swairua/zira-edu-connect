import { useState, useMemo } from 'react';
import { Scale, Download, Filter, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  TableFooter,
} from '@/components/ui/table';
import { useChartOfAccounts, useJournalEntries, useFunds } from '@/hooks/useAccounting';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Assets', color: 'bg-blue-100 text-blue-700' },
  { value: 'liability', label: 'Liabilities', color: 'bg-red-100 text-red-700' },
  { value: 'equity', label: 'Equity', color: 'bg-purple-100 text-purple-700' },
  { value: 'income', label: 'Income', color: 'bg-green-100 text-green-700' },
  { value: 'expense', label: 'Expenses', color: 'bg-orange-100 text-orange-700' },
];

interface TrialBalanceReportProps {
  institutionId: string | null;
}

export function TrialBalanceReport({ institutionId }: TrialBalanceReportProps) {
  const [fundFilter, setFundFilter] = useState<string>('all');
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const { data: accounts = [], isLoading: loadingAccounts } = useChartOfAccounts(institutionId);
  const { data: journalEntries = [], isLoading: loadingEntries } = useJournalEntries(institutionId);
  const { data: funds = [] } = useFunds(institutionId);

  // Calculate account balances from journal entries
  const accountBalances = useMemo(() => {
    const balances = new Map<string, { debit: number; credit: number }>();

    // Initialize all accounts with zero balances
    accounts.forEach((account) => {
      balances.set(account.id, { debit: 0, credit: 0 });
    });

    // Sum up journal entry lines
    journalEntries
      .filter((je) => je.status === 'posted')
      .filter((je) => new Date(je.entry_date) <= new Date(asOfDate))
      .forEach((entry) => {
        if (entry.lines) {
          entry.lines.forEach((line: { account_id: string; debit_amount: number; credit_amount: number; fund_id?: string }) => {
            if (fundFilter !== 'all' && line.fund_id !== fundFilter) return;
            
            const current = balances.get(line.account_id) || { debit: 0, credit: 0 };
            balances.set(line.account_id, {
              debit: current.debit + (line.debit_amount || 0),
              credit: current.credit + (line.credit_amount || 0),
            });
          });
        }
      });

    return balances;
  }, [accounts, journalEntries, fundFilter, asOfDate]);

  // Build trial balance data
  const trialBalanceData = useMemo(() => {
    return accounts
      .filter((account) => account.is_active)
      .map((account) => {
        const balance = accountBalances.get(account.id) || { debit: 0, credit: 0 };
        const netDebit = balance.debit - balance.credit;
        const netCredit = balance.credit - balance.debit;

        // Determine closing balance based on normal balance
        let closingDebit = 0;
        let closingCredit = 0;

        if (account.normal_balance === 'debit') {
          if (netDebit > 0) closingDebit = netDebit;
          else closingCredit = Math.abs(netDebit);
        } else {
          if (netCredit > 0) closingCredit = netCredit;
          else closingDebit = Math.abs(netCredit);
        }

        return {
          ...account,
          totalDebit: balance.debit,
          totalCredit: balance.credit,
          closingDebit,
          closingCredit,
          hasActivity: balance.debit > 0 || balance.credit > 0,
        };
      })
      .filter((account) => account.hasActivity)
      .sort((a, b) => a.account_code.localeCompare(b.account_code));
  }, [accounts, accountBalances]);

  // Calculate totals
  const totals = useMemo(() => {
    return trialBalanceData.reduce(
      (acc, account) => ({
        debit: acc.debit + account.closingDebit,
        credit: acc.credit + account.closingCredit,
      }),
      { debit: 0, credit: 0 }
    );
  }, [trialBalanceData]);

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = () => {
    // CSV Export
    const headers = ['Account Code', 'Account Name', 'Type', 'Debit', 'Credit'];
    const rows = trialBalanceData.map((account) => [
      account.account_code,
      account.account_name,
      account.account_type,
      account.closingDebit.toFixed(2),
      account.closingCredit.toFixed(2),
    ]);
    rows.push(['', 'TOTALS', '', totals.debit.toFixed(2), totals.credit.toFixed(2)]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${asOfDate}.csv`;
    a.click();
  };

  const isLoading = loadingAccounts || loadingEntries;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Trial Balance
              </CardTitle>
              <CardDescription>
                As of {format(new Date(asOfDate), 'MMMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <Select value={fundFilter} onValueChange={setFundFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Funds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Funds</SelectItem>
                  {funds.map((fund) => (
                    <SelectItem key={fund.id} value={fund.id}>
                      {fund.fund_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Debits</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.debit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.credit)}</p>
          </CardContent>
        </Card>
        <Card className={cn(isBalanced ? 'bg-green-50' : 'bg-red-50')}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                {isBalanced ? 'Balanced' : 'Unbalanced'}
              </Badge>
              {!isBalanced && (
                <span className="text-sm text-red-600">
                  Diff: {formatCurrency(Math.abs(totals.debit - totals.credit))}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
          ) : trialBalanceData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found for this period</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="text-right w-40">Debit (KES)</TableHead>
                  <TableHead className="text-right w-40">Credit (KES)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACCOUNT_TYPES.map((type) => {
                  const typeAccounts = trialBalanceData.filter(
                    (a) => a.account_type === type.value
                  );
                  if (typeAccounts.length === 0) return null;

                  return (
                    <>
                      <TableRow key={type.value} className="bg-muted/30">
                        <TableCell colSpan={5} className="font-semibold">
                          <Badge className={type.color}>{type.label}</Badge>
                        </TableCell>
                      </TableRow>
                      {typeAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-sm">
                            {account.account_code}
                          </TableCell>
                          <TableCell>{account.account_name}</TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {account.normal_balance}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {account.closingDebit > 0
                              ? formatCurrency(account.closingDebit)
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {account.closingCredit > 0
                              ? formatCurrency(account.closingCredit)
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted font-bold">
                  <TableCell colSpan={3}>TOTAL</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totals.debit)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(totals.credit)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
