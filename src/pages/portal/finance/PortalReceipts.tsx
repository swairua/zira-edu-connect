import { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Eye,
  Printer,
  Calendar,
  CreditCard,
  Smartphone,
  Banknote,
  Building,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { useFinanceReceipts, useCreateFinanceReceipt, useFunds, useBankAccounts } from '@/hooks/useAccounting';
import { useStaffProfile } from '@/hooks/useStaffProfile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'mpesa', label: 'M-Pesa', icon: Smartphone },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'cheque', label: 'Cheque', icon: CreditCard },
];

const PAYER_TYPES = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM = {
  receipt_date: format(new Date(), 'yyyy-MM-dd'),
  payer_type: 'other',
  payer_name: '',
  fund_id: '',
  bank_account_id: '',
  total_amount: 0,
  currency: 'KES',
  payment_method: 'cash',
  cheque_number: '',
  mpesa_code: '',
  bank_reference: '',
  narration: '',
};

export default function PortalReceipts() {
  const { data: profile } = useStaffProfile();
  const institutionId = profile?.institution_id || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const { data: receipts = [], isLoading } = useFinanceReceipts(institutionId);
  const { data: funds = [] } = useFunds(institutionId);
  const { data: bankAccounts = [] } = useBankAccounts(institutionId);
  const createReceipt = useCreateFinanceReceipt();

  const filteredReceipts = receipts.filter((receipt) => {
    if (statusFilter !== 'all' && receipt.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      receipt.receipt_number?.toLowerCase().includes(search) ||
      receipt.payer_name.toLowerCase().includes(search)
    );
  });

  // Summary calculations
  const todayTotal = receipts
    .filter((r) => r.receipt_date === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, r) => sum + r.total_amount, 0);

  const monthTotal = receipts
    .filter((r) => {
      const receiptDate = new Date(r.receipt_date);
      const now = new Date();
      return (
        receiptDate.getMonth() === now.getMonth() &&
        receiptDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, r) => sum + r.total_amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!institutionId || !formData.fund_id || !formData.bank_account_id) return;

    await createReceipt.mutateAsync({
      ...formData,
      institution_id: institutionId,
      status: 'approved',
    });
    setDialogOpen(false);
  };

  const getPaymentMethodIcon = (method: string) => {
    const config = PAYMENT_METHODS.find((m) => m.value === method);
    return config?.icon || CreditCard;
  };

  return (
    <PortalLayout title="Receipts" subtitle="Record and manage financial receipts">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{receipts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(todayTotal)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(monthTotal)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">
                {receipts.filter((r) => r.status === 'draft').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Receipts List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Receipts
                </CardTitle>
                <CardDescription>Financial receipts and collections</CardDescription>
              </div>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" />
                New Receipt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search receipts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Receipts Table */}
            {isLoading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No receipts found</p>
                <Button variant="outline" className="mt-4" onClick={handleOpenDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first receipt
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Fund</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => {
                    const MethodIcon = getPaymentMethodIcon(receipt.payment_method);

                    return (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-mono text-sm">
                          {receipt.receipt_number}
                        </TableCell>
                        <TableCell>
                          {format(new Date(receipt.receipt_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{receipt.payer_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {receipt.payer_type}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MethodIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">
                              {receipt.payment_method.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {receipt.fund ? (
                            <Badge variant="outline">{receipt.fund.fund_code}</Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCurrency(receipt.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              receipt.status === 'approved' && 'bg-green-100 text-green-700',
                              receipt.status === 'draft' && 'bg-amber-100 text-amber-700',
                              receipt.status === 'cancelled' && 'bg-red-100 text-red-700'
                            )}
                          >
                            {receipt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Receipt Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Receipt</DialogTitle>
            <DialogDescription>Record a financial receipt</DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt_date">Receipt Date</Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => setFormData((f) => ({ ...f, receipt_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer_type">Payer Type</Label>
                  <Select
                    value={formData.payer_type}
                    onValueChange={(v) => setFormData((f) => ({ ...f, payer_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payer_name">Payer Name</Label>
                <Input
                  id="payer_name"
                  value={formData.payer_name}
                  onChange={(e) => setFormData((f) => ({ ...f, payer_name: e.target.value }))}
                  placeholder="Enter payer name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fund_id">Receiving Fund</Label>
                  <Select
                    value={formData.fund_id}
                    onValueChange={(v) => setFormData((f) => ({ ...f, fund_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fund" />
                    </SelectTrigger>
                    <SelectContent>
                      {funds.map((fund) => (
                        <SelectItem key={fund.id} value={fund.id}>
                          {fund.fund_code} - {fund.fund_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_id">Bank Account</Label>
                  <Select
                    value={formData.bank_account_id}
                    onValueChange={(v) => setFormData((f) => ({ ...f, bank_account_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name} - {account.bank_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_amount">Amount (KES)</Label>
                  <Input
                    id="total_amount"
                    type="number"
                    value={formData.total_amount}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, total_amount: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(v) => setFormData((f) => ({ ...f, payment_method: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.payment_method === 'mpesa' && (
                <div className="space-y-2">
                  <Label htmlFor="mpesa_code">M-Pesa Code</Label>
                  <Input
                    id="mpesa_code"
                    value={formData.mpesa_code}
                    onChange={(e) => setFormData((f) => ({ ...f, mpesa_code: e.target.value }))}
                    placeholder="e.g. RJK4H5GF2D"
                  />
                </div>
            )}

            {formData.payment_method === 'cheque' && (
              <div className="space-y-2">
                <Label htmlFor="cheque_number">Cheque Number</Label>
                <Input
                  id="cheque_number"
                  value={formData.cheque_number}
                  onChange={(e) => setFormData((f) => ({ ...f, cheque_number: e.target.value }))}
                  placeholder="Cheque number"
                />
              </div>
            )}

            {formData.payment_method === 'bank_transfer' && (
              <div className="space-y-2">
                <Label htmlFor="bank_reference">Bank Reference</Label>
                <Input
                  id="bank_reference"
                  value={formData.bank_reference}
                  onChange={(e) => setFormData((f) => ({ ...f, bank_reference: e.target.value }))}
                  placeholder="Bank reference number"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="narration">Narration</Label>
              <Textarea
                id="narration"
                value={formData.narration}
                onChange={(e) => setFormData((f) => ({ ...f, narration: e.target.value }))}
                placeholder="Description of receipt..."
                rows={2}
              />
            </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !formData.payer_name ||
                !formData.fund_id ||
                !formData.bank_account_id ||
                formData.total_amount <= 0 ||
                createReceipt.isPending
              }
            >
              Save Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalLayout>
  );
}
